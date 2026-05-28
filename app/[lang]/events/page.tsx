"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { SearchResult } from "@/components/SearchResult";
import { SearchResultSkeleton } from "@/components/SearchResultSkeleton";
import { IoCalendarOutline } from "react-icons/io5";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

// Module-level cache to persist data across tab switches without full page reload
let cachedMyEvents: any[] | null = null;
let cachedSelectedDate: string = "";

export default function MyEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { t, language, localizeHref } = useLanguage();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`${localizeHref("/login")}?redirect=${encodeURIComponent(localizeHref("/events"))}`);
    }
  }, [user, authLoading, router, localizeHref]);
  const [events, setEvents] = useState<any[]>(cachedMyEvents || []);
  const [loading, setLoading] = useState(!cachedMyEvents);
  const [selectedDate, setSelectedDate] = useState<string>(cachedSelectedDate || "");
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const today = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();


  useEffect(() => {
    async function fetchMyEvents() {
      if (!user) return;
      if (!cachedMyEvents) {
        setLoading(true);
      }
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

        // Fetch events where user is the organizer (full date range)
        const { data: organizedData } = await supabase
          .from('events')
          .select('*')
          .in('organizer_id', allUserIds);
          
        // Fetch events where user is an attendee (include joined_at)
        const { data: attendedData } = await supabase
          .from('attendees')
          .select('joined_at, events (*)')
          .in('user_id', allUserIds);

        // Combine and deduplicate
        const combinedMap = new Map();
        
        const normalizeEvent = (e: any, userStartDate?: string) => {
          if (!e) return null;
          const dateNorm = e.date?.split('T')[0];
          const endDateNorm = e.end_date?.split('T')[0];
          return {
            ...e,
            date: dateNorm,
            end_date: endDateNorm,
            // _userStartDate: the date from which this user is relevant for this event
            _userStartDate: userStartDate && userStartDate > dateNorm ? userStartDate : dateNorm
          };
        };

        // Organizer events: user owns the full range
        (organizedData || []).forEach(e => {
          const norm = normalizeEvent(e);
          if (norm) combinedMap.set(norm.id, norm);
        });
        
        // Attended events: clip range to joined_at date
        (attendedData || []).forEach(a => {
          const joinedAt = a.joined_at ? a.joined_at.split('T')[0] : undefined;
          const norm = normalizeEvent(a.events, joinedAt);
          if (norm) {
            // Only overwrite if not already added as organizer (organizer gets full range)
            if (!combinedMap.has(norm.id)) {
              combinedMap.set(norm.id, norm);
            }
          }
        });

        const combined = Array.from(combinedMap.values());
        cachedMyEvents = combined;
        setEvents(combined);
        
        if (combined.length > 0) {
          const datesWithEvents = Array.from(new Set(
            combined.map(e => e._userStartDate || e.date)
          )).sort();

          let defaultDate = "";
          if (datesWithEvents.includes(today)) {
            defaultDate = today;
          } else {
            const nextDate = datesWithEvents.find(d => d >= today);
            defaultDate = nextDate || datesWithEvents[0];
          }

          if (!cachedSelectedDate || !datesWithEvents.includes(cachedSelectedDate)) {
            cachedSelectedDate = defaultDate;
            setSelectedDate(defaultDate);
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

  // Only show dates the user actually has events on (using _userStartDate for attended events)
  const availableDates = Array.from(new Set(
    events.map(e => e._userStartDate || e.date)
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
    const userStart = e._userStartDate || e.date;
    // Single-day event or user's start date matches selected
    if (userStart === selectedDate && !e.end_date) return true;
    // Multi-day: check if selected date falls within user's relevant range
    if (e.end_date && selectedDate >= userStart && selectedDate <= e.end_date) return true;
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
                  onClick={() => {
                    cachedSelectedDate = date;
                    setSelectedDate(date);
                  }}
                >
                  <span className="day-num">{dayNum}</span>
                  <span className="day-name">{isToday ? t.today : dayName}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="events-vertical-list">
          {loading ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <SearchResultSkeleton key={i} />
              ))}
            </>
          ) : filteredEvents.length > 0 ? (
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
