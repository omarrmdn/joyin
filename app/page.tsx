"use client";

import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { EventCard } from "@/components/EventCard";
import { Search, Filter, TrendingUp, Calendar, MapPin } from "lucide-react";

// This would normally come from Supabase
const dummyEvents = [
  {
    id: "1",
    title: "Summer Music Festival 2026",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop",
    location: "Central Park, NY",
    date: "July 15, 2026",
    price: 45,
    attendingCount: 1240,
    isPromoted: true
  },
  {
    id: "2",
    title: "Tech Innovators Summit",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop",
    location: "Convention Center",
    date: "August 02, 2026",
    price: "Free",
    attendingCount: 850
  },
  {
    id: "3",
    title: "Gourmet Food Expo",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop",
    location: "Downtown Plaza",
    date: "September 12, 2026",
    price: 15,
    attendingCount: 420
  },
  {
    id: "4",
    title: "Art & Design Workshop",
    image: "https://images.unsplash.com/photo-1460666819844-e2a4d7764ef5?q=80&w=2064&auto=format&fit=crop",
    location: "Modern Art Gallery",
    date: "October 05, 2026",
    price: 30,
    attendingCount: 150
  },
    {
    id: "5",
    title: "International Film Festival",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
    location: "Grand Theater",
    date: "November 20, 2026",
    price: 25,
    attendingCount: 2100,
    isPromoted: true
  },
  {
    id: "6",
    title: "Winter Startup Pitch",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop",
    location: "Innovation Hub",
    date: "December 15, 2026",
    price: "Free",
    attendingCount: 340
  }
];

export default function Home() {
  return (
    <div className="app-container">
      <TopBar />
      <Sidebar />
      
      <main className="main-content">
        <header className="page-header">
          <div className="header-search">
            <Search className="search-icon" size={20} />
            <input type="text" placeholder="Search events, organizers, locations..." className="search-input" />
            <button className="filter-button">
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>
        </header>

        <section className="hero-section glass">
          <div className="hero-content">
            <span className="hero-badge">Upcoming Events</span>
            <h2 className="hero-title">Discover the Best Events Happening Near You</h2>
            <p className="hero-subtitle">Join thousands of people discovering new experiences, learning skills, and making connections every day.</p>
            <div className="hero-actions">
              <button className="primary-button">Explore Events</button>
              <button className="secondary-button">How it Works</button>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <TrendingUp size={24} className="stat-icon" />
              <div>
                <span className="stat-value">500+</span>
                <span className="stat-label">Daily Events</span>
              </div>
            </div>
          </div>
        </section>

        <section className="events-section">
          <div className="section-header">
            <h2 className="section-title">Featured Events</h2>
            <div className="section-tabs">
              <button className="tab active">All</button>
              <button className="tab">Music</button>
              <button className="tab">Tech</button>
              <button className="tab">Food</button>
              <button className="tab">Art</button>
            </div>
          </div>

          <div className="event-grid">
            {dummyEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </section>
      </main>

      <style jsx>{`
        .page-header {
          margin-bottom: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-search {
          display: flex;
          align-items: center;
          background: var(--card-background);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 0.5rem 1rem;
          width: 100%;
          max-width: 600px;
          gap: 0.75rem;
          transition: var(--transition);
        }

        .header-search:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-transparent);
        }

        .search-input {
          flex: 1;
          background: none;
          border: none;
          color: var(--foreground);
          font-size: 0.95rem;
          outline: none;
          padding: 0.5rem 0;
        }

        .search-icon {
          color: var(--secondary-text);
        }

        .filter-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--border);
          color: var(--foreground);
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          transition: var(--transition);
        }

        .filter-button:hover {
          background: var(--primary);
          color: white;
        }

        .hero-section {
          padding: 4rem;
          border-radius: 24px;
          margin-bottom: 3rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255, 50, 4, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
        }

        .hero-section::before {
          content: "";
          position: absolute;
          top: -100px;
          right: -100px;
          width: 300px;
          height: 300px;
          background: var(--primary);
          filter: blur(150px);
          opacity: 0.15;
          z-index: 0;
        }

        .hero-content {
          max-width: 600px;
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          background: var(--primary-transparent);
          color: var(--primary);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.81rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: inline-block;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 3rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--secondary-text);
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
        }

        .hero-stats {
          background: rgba(255, 255, 255, 0.05);
          padding: 2rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          backdrop-filter: blur(10px);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          color: var(--primary);
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .stat-label {
          color: var(--secondary-text);
          font-size: 0.875rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.75rem;
        }

        .section-tabs {
          display: flex;
          gap: 0.5rem;
          background: var(--card-background);
          padding: 0.4rem;
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .tab {
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--secondary-text);
          transition: var(--transition);
        }

        .tab:hover {
          color: var(--foreground);
        }

        .tab.active {
          background: var(--primary);
          color: white;
        }

        @media (max-width: 1024px) {
          .hero-section {
            padding: 3rem;
          }
          .hero-title {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .hero-stats {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .main-content {
            padding-top: 5rem;
          }
          .hero-section {
            padding: 2rem;
          }
          .hero-title {
            font-size: 2rem;
          }
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          .section-tabs {
             width: 100%;
             overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
