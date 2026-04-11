"use client";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { SearchResult } from "@/components/SearchResult";
import { IoCalendarOutline } from "react-icons/io5";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export default function MyEventsPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    async function fetchMyEvents() {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch events where user is organizer OR participant
        const { data: organizedData } = await supabase
          .from('events')
          .select('*')
          .eq('organizer_id', user.id);
          
        const { data: attendedData } = await supabase
          .from('attendees')
          .select('events (*)')
          .eq('user_id', user.id);
        
        const attendingEvents = attendedData?.map(a => a.events).filter(Boolean) || [];
        const organizedEvents = organizedData || [];
        
        // Combine and deduplicate
        const combinedMap = new Map();
        organizedEvents.forEach(e => combinedMap.set(e.id, e));
        attendingEvents.forEach(e => combinedMap.set(e.id, e));
        const combined = Array.from(combinedMap.values());
        
        setEvents(combined);
        if (combined.length > 0) {
          setSelectedDate(combined[0].date);
        }
      } catch (error) {
        console.error("Error fetching my events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyEvents();
  }, [user]);

  const availableDates = Array.from(new Set(
    events.flatMap(e => e.end_date ? getDaysInRange(e.date, e.end_date) : [e.date])
  )).sort();

  function getDaysInRange(start: string, end: string) {
    try {
      const days = [];
      const curr = new Date(start);
      const last = new Date(end);
      while (curr <= last) {
        days.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
      return days;
    } catch (e) {
      return [start];
    }
  }
  
  const today = new Date().toISOString().split('T')[0];
  const locale = language === "ar-EG" ? "ar-EG" : "en-US";

  const filteredEvents = events.filter(e => {
    if (e.date === selectedDate) return true;
    if (e.end_date && selectedDate >= e.date && selectedDate <= e.end_date) return true;
    return false;
  });

  return (
    <>
      <div className="topbar-wrapper">
        <TopBar />
      </div>
      
      <div className="events-web-container">
        <div className="events-header-simple">
          <h1>{t.myEvents}</h1>
        </div>

        <div className="days-horizontal-slider">
          <div className="days-slider-inner">
            {availableDates.map(date => {
              const d = new Date(date);
              const dayName = d.toLocaleDateString(locale, { weekday: "short" });
              const dayNum = d.getDate();
              const isSelected = selectedDate === date;
              const isToday = date === today;
              
              return (
                <button 
                  key={date} 
                  className={`day-square-card ${isSelected ? 'active' : ''} ${isToday ? 'is-today' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="day-num">{dayNum}</span>
                  <span className="day-name">{isToday ? t.today : dayName}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="events-vertical-list">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <SearchResult key={event.id} event={event} index={index} />
            ))
          ) : (
            <div className="empty-state-simple">
              <IoCalendarOutline size={48} />
              <p>{t.noEventsForDay}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
