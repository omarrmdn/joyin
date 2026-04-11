"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { TagsBar } from "@/components/TagsBar";
import { EventCard } from "@/components/EventCard";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [activeTag, setActiveTag] = useState("All");
  const [events, setEvents] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

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
          setTags(["All", ...tagsData.map(t => t.name)]);
        }

        // Fetch Events
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });
        
        if (eventsData) {
          setEvents(eventsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredEvents = events.filter(
    (event) => {
      if (activeTag === "All") return true;
      return event.tags?.includes(activeTag);
    }
  );

  return (
    <>
      <div className="topbar-wrapper">
        <TopBar />
        <TagsBar
          tags={tags}
          activeTag={activeTag}
          onTagPress={setActiveTag}
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
