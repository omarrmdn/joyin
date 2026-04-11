"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { TagsBar } from "@/components/TagsBar";
import { EventCard } from "@/components/EventCard";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [activeTag, setActiveTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch Tags
        const { data: tagsData } = await supabase
          .from('tags')
          .select('name')
          .order('name');
        
        if (tagsData) {
          setTags(["All", "Near me", ...tagsData.map(t => t.name)]);
        }

        // Fetch Events with Tag mapping
        const { data: eventsData } = await supabase
          .from('events')
          .select(`
            *,
            event_tags (
              tags (
                name
              )
            )
          `)
          .order('date', { ascending: true });
        
        if (eventsData) {
          // Transform event_tags into a flat string array
          const mappedEvents = eventsData.map(event => ({
            ...event,
            tags: event.event_tags?.map((et: any) => et.tags?.name).filter(Boolean) || []
          }));
          setEvents(mappedEvents);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLocationDetection = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setActiveTag("Near me");
        },
        (error) => {
          alert("Error detecting location: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const filteredEvents = events.filter(
    (event) => {
      // 1. Tag Filter
      if (activeTag === "Near me") {
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

      if (activeTag !== "All") {
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
          onSearchChange={setSearchQuery} 
          onLocationPress={handleLocationDetection}
        />
        <TagsBar
          tags={tags}
          activeTag={activeTag}
          onTagPress={(tag) => {
            if (tag === "Near me" && !userLocation) {
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
            <span className="empty-text">Loading events...</span>
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
              price={event.price === 0 ? "Free" : event.price}
              attendingCount={event.attendees_count || 0}
              attendingAvatars={[]}
            />
          ))
        ) : (
          <div className="center-content">
            <span className="empty-text">
              {activeTag === "All" 
                ? "No events available yet."
                : `No events found for "${activeTag}".`}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
