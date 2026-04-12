"use client";
import { useEffect, useState, useRef } from "react";
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
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const today = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();


  useEffect(() => {
    async function fetchMyEvents() {
      if (!user) return;
      setLoading(true);
      try {
        let allUserIds = [user.id];
        
        if (user.email) {
          const { data: userAliases } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email);
          
          if (userAliases) {
            const aliasIds = userAliases.map(u => u.id);
            allUserIds = Array.from(new Set([...allUserIds, ...aliasIds]));
          }
        }

        // Fetch events where any of the user's identities is organizer OR participant
        const { data: organizedData } = await supabase
          .from('events')
          .select('*')
          .in('organizer_id', allUserIds);
          
        const { data: attendedData } = await supabase
          .from('attendees')
          .select('events (*)')
          .in('user_id', allUserIds);

        // Combine and deduplicate
        const combinedMap = new Map();
        
        const normalizeEvent = (e: any) => {
          if (!e) return null;
          return {
            ...e,
            date: e.date?.split('T')[0],
            end_date: e.end_date?.split('T')[0]
          };
        };

        (organizedData || []).forEach(e => {
          const norm = normalizeEvent(e);
          if (norm) combinedMap.set(norm.id, norm);
        });
        
        (attendedData || []).forEach(a => {
          const norm = normalizeEvent(a.events);
          if (norm) combinedMap.set(norm.id, norm);
        });

        const combined = Array.from(combinedMap.values());
        setEvents(combined);
        
        if (combined.length > 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          const datesWithEvents = Array.from(new Set(
            combined.flatMap(e => e.end_date ? getDaysInRange(e.date, e.end_date) : [e.date])
          )).sort();

          if (datesWithEvents.includes(today)) {
            setSelectedDate(today);
          } else {
            const nextDate = datesWithEvents.find(d => d >= today);
            setSelectedDate(nextDate || datesWithEvents[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching my events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyEvents();
  }, [user, today]);

  useEffect(() => {
    if (selectedDate && sliderRef.current) {
      const activeEl = sliderRef.current.querySelector('.day-square-card.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);

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
  
  const locale = language === "ar-EG" ? "ar-EG" : "en-US";

  const filteredEvents = events.filter(e => {
    // Both e.date and selectedDate are now normalized YYYY-MM-DD
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

        <div className="days-horizontal-slider" ref={sliderRef}>
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
