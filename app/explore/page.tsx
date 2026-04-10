"use client";

import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { EventCard } from "@/components/EventCard";
import { IoSearchOutline, IoLocationSharp, IoCalendarSharp, IoOptionsOutline } from "react-icons/io5";

export default function ExplorePage() {
  return (
    <>
      <div className="topbar-wrapper">
        <TopBar />
      </div>
      
      <div className="explore-content-container">
        <header className="page-header">
           <h1 className="explore-title">Explore Events</h1>
           <p className="explore-subtitle">Find what&apos;s happening around the world or right next door.</p>
        </header>

        <div className="search-box-container glass-lux">
           <div className="search-main">
             <IoSearchOutline className="icon" />
             <input type="text" placeholder="What are you interested in?" />
           </div>
           <div className="search-divider"></div>
           <div className="search-location">
             <IoLocationSharp className="icon" color="var(--accent)" />
             <input type="text" placeholder="Anywhere" />
           </div>
           <button className="publish-btn search-submit-btn">Search</button>
        </div>

        <div className="category-chips">
           {["All", "Concerts", "Networking", "Parties", "Tech", "Workshops", "Art", "Food", "Charity"].map(cat => (
             <button key={cat} className="chip">{cat}</button>
           ))}
        </div>

        <section className="results-section">
           <div className="results-header">
             <span>Found 1,240 events</span>
             <button className="filter-text-btn">
                <IoOptionsOutline size={16} />
                Sort & Filter
             </button>
           </div>

           <div className="feed-container">
               {/* This would be populated dynamically */}
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
