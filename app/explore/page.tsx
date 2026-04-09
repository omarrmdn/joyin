import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { EventCard } from "@/components/EventCard";
import { Search, MapPin, Calendar, SlidersHorizontal } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="app-container">
      <TopBar />
      <Sidebar />
      
      <main className="main-content">
        <header className="page-header">
           <h1 className="explore-title">Explore Events</h1>
           <p className="explore-subtitle">Find what's happening around the world or right next door.</p>
        </header>

        <div className="search-box-container glass">
           <div className="search-main">
             <Search className="icon" />
             <input type="text" placeholder="What are you interested in?" />
           </div>
           <div className="search-divider"></div>
           <div className="search-location">
             <MapPin className="icon" />
             <input type="text" placeholder="Anywhere" />
           </div>
           <button className="primary-button search-submit">Search</button>
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
                <SlidersHorizontal size={16} />
                Sort & Filter
             </button>
           </div>

           <div className="event-grid">
               {/* This would be populated dynamically */}
           </div>
        </section>
      </main>

      <style jsx>{`
        .explore-title {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .explore-subtitle {
          color: var(--secondary-text);
          font-size: 1.1rem;
          margin-bottom: 3rem;
        }

        .search-box-container {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          border-radius: 20px;
          margin-bottom: 2.5rem;
          gap: 1rem;
        }

        .search-main, .search-location {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          padding: 0.75rem 1rem;
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
          font-size: 1rem;
          outline: none;
          width: 100%;
        }

        .search-submit {
          padding: 0.75rem 2rem;
          border-radius: 12px;
        }

        .category-chips {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }

        .chip {
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          background: var(--card-background);
          border: 1px solid var(--border);
          color: var(--foreground);
          font-size: 0.875rem;
          transition: var(--transition);
        }

        .chip:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          font-size: 0.9rem;
          color: var(--secondary-text);
        }

        .filter-text-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--foreground);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .search-box-container {
            flex-direction: column;
            gap: 0.5rem;
            padding: 1.5rem;
          }
          .search-divider {
            display: none;
          }
          .search-submit {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
