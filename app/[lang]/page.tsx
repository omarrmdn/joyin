"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { TagsBar } from "@/components/TagsBar";
import { EventCard } from "@/components/EventCard";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/language-context";
import { useActions } from "@/hooks/use-actions";

export default function Home() {
  const { t, language } = useLanguage();
  const [activeTag, setActiveTag] = useState(t.all);
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([t.all, t.nearMe]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { logAction } = useActions();

  useEffect(() => {
    // 0. IMMEDIATELY update labels for high-level tags to avoid "lag"
    setActiveTag(prev => {
      if (prev === "All" || prev === "الكل") return t.all;
      if (prev === "Near me" || prev === "قريب مني") return t.nearMe;
      return prev;
    });

    setTags(prev => {
      const next = [...prev];
      if (next.length > 0) next[0] = t.all;
      if (next.length > 1) next[1] = t.nearMe;
      return next;
    });

    async function fetchData() {
      setLoading(true);
      try {
        // 1. Fetch ALL tags once to build a mapping for language syncing
        const { data: allTagsData } = await supabase
          .from('tags')
          .select('name, tag_translations(language_code, name)');
        
        const tagMap: Record<string, string> = {};
        const langCode = language === "ar-EG" ? "ar" : "en";
        
        if (allTagsData) {
          allTagsData.forEach((tag: any) => {
            const translation = tag.tag_translations?.find((t: any) => t.language_code === langCode);
            const label = translation ? translation.name : tag.name;
            // Map both directions to help with syncing
            tagMap[tag.name] = label; 
          });
        }

        // 2. Fetch Events with Tag mapping and attendee count
        const { data: eventsData } = await supabase
          .from('events')
          .select(`
            *,
            event_tags (
              tags (
                name,
                tag_translations (
                  language_code,
                  name
                )
              )
            ),
            attendees (
              user_id,
              users:user_id (
                image_url
              )
            )
          `)
          .order('date', { ascending: true });
        
        if (eventsData) {
          // Transform event_tags into localized labels
          const mappedEvents = eventsData.map(event => ({
            ...event,
            tags: event.event_tags?.map((et: any) => {
              const tag = et.tags;
              if (!tag) return null;
              const tr = tag.tag_translations?.find((t: any) => t.language_code === langCode);
              return tr ? tr.name : tag.name;
            }).filter(Boolean) || [],
            attendees_count: event.attendees?.length || 0,
            attending_avatars: event.attendees
              ?.map((a: any) => a.users?.image_url)
              .filter(Boolean)
              .slice(0, 3) || []
          }));
          setEvents(mappedEvents);

          const uniqueTagsLabels = new Set<string>();
          mappedEvents.forEach(event => {
            event.tags.forEach((tag: string) => uniqueTagsLabels.add(tag));
          });
          const sortedTags = Array.from(uniqueTagsLabels).sort();
          setTags([t.all, t.nearMe, ...sortedTags]);

          // SYNC ACTIVE TAG: General fix for ALL tags
          setActiveTag(prev => {
            if (prev === "All" || prev === "الكل") return t.all;
            if (prev === "Near me" || prev === "قريب مني") return t.nearMe;
            
            // For database tags, we need to find the equivalent label in the new language
            // Since we don't know the "previous" language easily here, we can try to find 
            // the tag in the previous language and map it to its ID, then back to the new label.
            // But a simpler way since tags are unique: check if the 'prev' is a key or value in our mapping
            if (allTagsData) {
              const tagObj = allTagsData.find((tag: any) => {
                const enName = tag.name;
                const arName = tag.tag_translations?.find((t: any) => t.language_code === "ar")?.name;
                return prev === enName || prev === arName;
              });

              if (tagObj) {
                const newTr = tagObj.tag_translations?.find((t: any) => t.language_code === langCode);
                return newTr ? newTr.name : tagObj.name;
              }
            }
            
            return prev;
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Log page view
    logAction({ action_type: 'view_home' });
  }, [language]); // Re-fetch when language changes to update tag labels

  const handleLocationDetection = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setActiveTag(t.nearMe);
        },
        (error) => {
          alert(t.errorDetectingLocation + error.message);
        }
      );
    } else {
      alert(t.geoNotSupported);
    }
  };

  const filteredEvents = events.filter(
    (event) => {
      // 1. Tag Filter
      if (activeTag === t.nearMe) {
        if (!userLocation) return false;
        // Simple radius check if event has coordinates
        if (event.latitude && event.longitude) {
           const dist = Math.sqrt(
             Math.pow(event.latitude - userLocation.lat, 2) + 
             Math.pow(event.longitude - userLocation.lng, 2)
           );
           return dist < 0.5; // Roughly ~50km
        }
        return false;
      }

      if (activeTag !== t.all) {
        if (!event.tags?.includes(activeTag)) return false;
      }

      // 2. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.title?.toLowerCase().includes(query);
        const matchesLocation = event.location?.toLowerCase().includes(query);
        const matchesTags = event.tags?.some((t: string) => t.toLowerCase().includes(query));
        
        if (!matchesTitle && !matchesLocation && !matchesTags) return false;
      }

      return true;
    }
  );

  return (
    <>
      <div className="topbar-wrapper">
        <TopBar 
          searchQuery={searchQuery} 
          onSearchChange={(query) => {
            setSearchQuery(query);
            // We could debounce this, but for now let's just log if they type something substantial
            if (query.length > 3 && query.length % 5 === 0) {
              logAction({ 
                action_type: 'search_events', 
                metadata: { query } 
              });
            }
          }} 
          onLocationPress={() => {
            logAction({ action_type: 'click_near_me' });
            handleLocationDetection();
          }}
        />
        <TagsBar
          tags={tags}
          activeTag={activeTag}
          onTagPress={(tag) => {
            logAction({ 
              action_type: 'click_tag', 
              metadata: { tag } 
            });
            if (tag === t.nearMe && !userLocation) {
              handleLocationDetection();
            } else {
              setActiveTag(tag);
            }
          }}
        />
      </div>

      <div className="feed-container">
        {loading ? (
          <div className="center-content">
            <span className="empty-text">{t.loadingEvents}</span>
          </div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard 
              key={event.id} 
              id={event.id}
              title={event.title}
              image={event.image_url || event.image}
              location={event.location}
              date={event.date}
              endDate={event.end_date}
              price={event.price === 0 ? t.free : event.price}
              attendingCount={event.attendees_count || 0}
              attendingAvatars={event.attending_avatars || []}
              isOnline={event.is_online}
            />
          ))
        ) : (
          <div className="center-content">
            <span className="empty-text">
              {activeTag === t.all 
                ? t.noEventsYet
                : `${t.noEventsForTag} "${activeTag}".`}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
