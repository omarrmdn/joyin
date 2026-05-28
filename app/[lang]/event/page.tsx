"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { EventCard } from "@/components/EventCard";
import { IoSearchOutline, IoLocationSharp, IoOptionsOutline } from "react-icons/io5";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/language-context";

// Module-level cache to persist data across tab switches without full page reload
let cachedEvents: any[] | null = null;
let cachedTags: string[] | null = null;

export default function ExplorePage() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<any[]>(cachedEvents || []);
  const [tags, setTags] = useState<string[]>(cachedTags || [t?.all || "All"]);
  const [activeTag, setActiveTag] = useState(t?.all || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [loading, setLoading] = useState(!cachedEvents);

  useEffect(() => {
    async function fetchData() {
      if (!cachedEvents) {
        setLoading(true);
      }
      try {
        const { data: eventsData } = await supabase.from('events').select(`
          *,
          event_tags (tags (name)),
          attendees (
            user_id,
            users:user_id (
              image_url
            )
          )
        `).order('date', { ascending: true });
        
        if (eventsData) {
          const mappedEvents = eventsData.map(e => ({
            ...e,
            tags: (e.event_tags as any)?.map((et: any) => et.tags?.name).filter(Boolean) || [],
            attendingCount: e.attendees?.length || 0,
            attendingAvatars: e.attendees
              ?.map((a: any) => a.users?.image_url)
              .filter(Boolean)
              .slice(0, 3) || []
          }));
          
          cachedEvents = mappedEvents;
          setEvents(mappedEvents);

          const uniqueTags = new Set<string>();
          mappedEvents.forEach(event => {
            event.tags.forEach((tag: string) => uniqueTags.add(tag));
          });
          const sortedTags = Array.from(uniqueTags).sort();
          const mappedTags = [t.all, ...sortedTags];
          
          cachedTags = mappedTags;
          setTags(mappedTags);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [t.all]);

  const filteredEvents = events.filter(event => {
    const matchesTag = activeTag === t.all || event.tags?.includes(activeTag);
    const matchesSearch = !searchQuery || 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLoc = !locationQuery || 
      event.location?.toLowerCase().includes(locationQuery.toLowerCase());
    
    return matchesTag && matchesSearch && matchesLoc;
  });

  return (
    <>
      <div className="topbar-wrapper">
        <TopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>
      
      <div className="explore-content-container">
        <header className="page-header">
           <h1 className="explore-title">{t.searchPlaceholder.split(',')[0]}</h1>
           <p className="explore-subtitle">{t.searchPlaceholder}</p>
        </header>

        <div className="search-box-container glass-lux">
           <div className="search-main">
             <IoSearchOutline className="icon" />
             <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <div className="search-divider"></div>
           <div className="search-location">
             <IoLocationSharp className="icon" color="var(--accent)" />
             <input 
              type="text" 
              placeholder={t.location} 
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
             />
           </div>
           <button className="publish-btn search-submit-btn">{t.searchPlaceholder.split(' ')[0]}</button>
        </div>

        <div className="category-chips">
           {tags.map(cat => (
             <button 
              key={cat} 
              className={`chip ${activeTag === cat ? 'active' : ''}`}
              onClick={() => setActiveTag(cat)}
             >
              {cat}
             </button>
           ))}
        </div>

        <section className="results-section">
           <div className="results-header">
             <span>{filteredEvents.length} {t.attending}</span>
             <button className="filter-text-btn">
                <IoOptionsOutline size={16} />
             </button>
           </div>

           <div className="feed-container">
               {loading ? (
                 <p>{t.loadingEvents}</p>
               ) : filteredEvents.length > 0 ? (
                 filteredEvents.map(event => (
                   <EventCard 
                    key={event.id}
                    {...event}
                    image={event.image_url || event.image}
                    attendingCount={event.attendingCount || 0}
                    attendingAvatars={event.attendingAvatars || []}
                   />
                 ))
               ) : (
                 <p>{t.noEventsYet}</p>
               )}
           </div>
        </section>
      </div>

      <style jsx>{`
        .explore-content-container {
          padding: 40px;
          max-width: 1400px;
        }

        .explore-title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .explore-subtitle {
          color: var(--secondary-text);
          font-size: 16px;
          margin-bottom: 32px;
        }

        .search-box-container {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 20px;
          margin-bottom: 32px;
          gap: 12px;
          background: var(--card-background);
          border: 1px solid var(--border);
        }

        .search-main, .search-location {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          padding: 8px 16px;
        }

        .search-divider {
          width: 1px;
          height: 30px;
          background: var(--border);
        }

        .icon {
          color: var(--primary);
        }

        input {
          background: none;
          border: none;
          color: var(--foreground);
          font-size: 16px;
          outline: none;
          width: 100%;
        }

        .search-submit-btn {
          max-width: 150px;
          padding: 12px 24px;
        }

        .category-chips {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }

        /* Reusing global styles where possible */
        .chip {
          padding: 8px 18px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          background: var(--card-background);
          border: 1px solid var(--border);
          color: var(--secondary-text);
          transition: var(--transition);
        }

        .chip:hover {
          border-color: var(--primary);
          color: var(--foreground);
          background: #1a1a1a;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          font-size: 14px;
          color: var(--secondary-text);
        }

        .filter-text-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--foreground);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .explore-content-container { padding: 20px; }
          .search-box-container {
            flex-direction: column;
            gap: 10px;
            padding: 16px;
          }
          .search-divider {
            display: none;
          }
          .search-submit-btn {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}
