"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { TagsBar } from "@/components/TagsBar";
import { EventCard } from "@/components/EventCard";

// Mock data based on the RN app structure
const availableTags = ["All", "Near me", "Music", "Tech", "Food", "Art", "Startups"];

const dummyEvents = [
  {
    id: "1",
    title: "Summer Music Festival 2026",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop",
    location: "Central Park, NY",
    date: "July 15, 2026",
    price: 45,
    attendingCount: 1240,
    attendingAvatars: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    ],
    tags: ["Music", "All"],
  },
  {
    id: "6",
    title: "Global AI & Robotics Expo",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop",
    location: "Exhibition Hall, WA",
    date: "Dec 10, 2026",
    endDate: "Dec 25, 2026",
    price: 150,
    attendingCount: 4500,
    attendingAvatars: [
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=50&h=50&fit=crop",
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=50&h=50&fit=crop",
    ],
    tags: ["Tech", "All"],
  },
  {
    id: "2",
    title: "Tech Innovators Summit",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop",
    location: "Convention Center",
    date: "August 02, 2026",
    endDate: "August 05, 2026",
    price: "Free",
    attendingCount: 850,
    attendingAvatars: [
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=50&h=50&fit=crop",
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=50&h=50&fit=crop",
    ],
    tags: ["Tech", "Startups", "All"],
  },
  {
    id: "3",
    title: "Gourmet Food Expo",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop",
    location: "Downtown Plaza",
    date: "September 12, 2026",
    price: 15,
    attendingCount: 420,
    attendingAvatars: [
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop",
    ],
    tags: ["Food", "All", "Near me"],
  },
  {
    id: "4",
    title: "Art & Design Workshop",
    image: "https://images.unsplash.com/photo-1460666819844-e2a4d7764ef5?q=80&w=2064&auto=format&fit=crop",
    location: "Modern Art Gallery",
    date: "October 05, 2026",
    price: 30,
    attendingCount: 150,
    attendingAvatars: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop",
    ],
    tags: ["Art", "All"],
  },
  {
    id: "5",
    title: "International Film Festival",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
    location: "Grand Theater",
    date: "November 20, 2026",
    price: 25,
    attendingCount: 2100,
    attendingAvatars: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    ],
    tags: ["Art", "All"],
  },
];

export default function Home() {
  const [activeTag, setActiveTag] = useState("All");

  const filteredEvents = dummyEvents.filter(
    (event) => activeTag === "All" || event.tags.includes(activeTag)
  );

  return (
    <>
      <div className="topbar-wrapper">
        <TopBar />
        <TagsBar
          tags={availableTags}
          activeTag={activeTag}
          onTagPress={setActiveTag}
        />
      </div>

      <div className="feed-container">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard key={event.id} {...event} />
          ))
        ) : (
          <div className="center-content">
            <span className="empty-text">
              No events found for &quot;{activeTag}&quot;.
            </span>
          </div>
        )}
      </div>
    </>
  );
}
