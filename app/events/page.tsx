"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { SearchResult } from "@/components/SearchResult";
import { IoCalendarOutline } from "react-icons/io5";

// Mock data spanning different dates
const myEvents = [
  {
    id: "m1",
    title: "Startup Weekend Hackathon",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
    location: "Tech Hub Sandbox",
    date: "Dec 10, 2026",
    rawDate: "2026-12-10",
    rawEndDate: "2026-12-12",
    price: "Free",
    isAttending: true,
  },
  {
    id: "m2",
    title: "UI/UX Masterclass",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
    location: "Creative Studios",
    date: "Dec 15, 2026",
    rawDate: "2026-12-15",
    price: "$150",
    isAttending: true,
  },
  {
    id: "m3",
    title: "Product Marketing Summit",
    image: "https://images.unsplash.com/photo-1475721028070-17cb25e7d56e?q=80&w=2000&auto=format&fit=crop",
    location: "Grand Hotel",
    date: "Dec 15, 2026",
    rawDate: "2026-12-15",
    price: "$299",
    isAttending: true,
  }
];

export default function MyEventsPage() {
  const getDaysInRange = (start: string, end: string) => {
    const days = [];
    const curr = new Date(start);
    const last = new Date(end);
    while (curr <= last) {
      days.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  };

  const availableDates = Array.from(new Set(
    myEvents.flatMap(e => e.rawEndDate ? getDaysInRange(e.rawDate, e.rawEndDate) : [e.rawDate])
  )).sort();
  
  // Get today's date string
  const today = new Date().toISOString().split('T')[0];

  // Default to today if it exists in data, otherwise the first date
  const initialDate = availableDates.includes(today) ? today : (availableDates[0] || "");
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);

  const filteredEvents = myEvents.filter(e => {
    if (e.rawDate === selectedDate) return true;
    if (e.rawEndDate && selectedDate >= e.rawDate && selectedDate <= e.rawEndDate) return true;
    return false;
  });

  return (
    <>
      <div className="topbar-wrapper">
        <TopBar />
      </div>
      
      <div className="events-web-container">
        <div className="events-header-simple">
          <h1>My Events</h1>
        </div>

        <div className="days-horizontal-slider">
          <div className="days-slider-inner">
            {availableDates.map(date => {
              const d = new Date(date);
              const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
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
                  <span className="day-name">{isToday ? "Today" : dayName}</span>
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
              <p>No events found for this day.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
