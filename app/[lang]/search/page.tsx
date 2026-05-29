"use client";

import { useEffect, useState, useRef } from "react";
import { IoSearchOutline, IoCloseOutline, IoArrowBack } from "react-icons/io5";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/language-context";
import { EventCard } from "@/components/EventCard";
import { EventCardSkeleton } from "@/components/EventCardSkeleton";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchPage() {
  const { t, language, localizeHref } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  
  // Filters
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid" | "custom">("all");
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [priceTo, setPriceTo] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "online" | "onsite">("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Auto-focus the search input
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const langCode = language === "ar-EG" ? "ar" : "en";
        const { data: eventsData } = await supabase
          .from("events")
          .select(`
            *,
            event_tags (
              tags (
                name,
                tag_translations (
                  language_code,
                  name
                )
              )
            ),
            attendees (
              user_id,
              users:user_id (
                image_url
              )
            )
          `)
          .order("date", { ascending: true });

        if (eventsData) {
          const now = new Date();
          const mappedEvents = eventsData
            .filter((event) => {
              if (event.status === 'canceled') return false;
              const eventEnd = event.end_date 
                ? new Date(`${event.end_date}T${event.end_time || '23:59:59'}`) 
                : new Date(`${event.date}T${event.time || '23:59:59'}`);
              return eventEnd >= now;
            })
            .map((event) => ({
            ...event,
            tags:
              event.event_tags
                ?.map((et: any) => {
                  const tag = et.tags;
                  if (!tag) return null;
                  const tr = tag.tag_translations?.find(
                    (t: any) => t.language_code === langCode
                  );
                  return tr ? tr.name : tag.name;
                })
                .filter(Boolean) || [],
            attendees_count: event.attendees?.length || 0,
          }));
          setEvents(mappedEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [language]);

  const filteredEvents = events.filter((event) => {
    // 1. Text Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = event.title?.toLowerCase().includes(query);
      const matchesLocation = event.location?.toLowerCase().includes(query);
      const matchesTags = event.tags?.some((t: string) =>
        t.toLowerCase().includes(query)
      );
      const matchesDescription = event.description?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesLocation && !matchesTags && !matchesDescription) {
        return false;
      }
    }

    // 2. Tag Filter
    if (selectedTag && !event.tags?.includes(selectedTag)) return false;

    // 3. Price Filter
    if (priceFilter === "free" && event.price !== 0) return false;
    if (priceFilter === "paid" && event.price === 0) return false;
    if (priceFilter === "custom") {
      if (priceFrom && event.price < Number(priceFrom)) return false;
      if (priceTo && event.price > Number(priceTo)) return false;
    }

    // 4. Target Audience Filter
    if (genderFilter !== "all" && event.gender !== genderFilter) return false;

    // 5. Type Filter
    if (typeFilter === "online" && !event.is_online) return false;
    if (typeFilter === "onsite" && event.is_online) return false;

    return true;
  });

  const allTags = Array.from(new Set(events.flatMap(e => e.tags)));
  
  // Suggestions (random 5 events if not searched)
  const suggestions = events.slice(0, 5);

  const hasActiveFilters = selectedTag !== "" || priceFilter !== "all" || genderFilter !== "all" || typeFilter !== "all";

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setHasSearched(true);
    }
  }, [searchQuery]);

  return (
    <div className="search-page">
      {/* Search Header */}
      <div className="search-page-header">
        <button
          className="search-back-btn"
          onClick={() => router.back()}
          aria-label={t.back}
        >
          <IoArrowBack size={24} />
        </button>
        <h1 className="search-page-title">{language === 'ar-EG' ? 'البحث' : 'Search'}</h1>
      </div>

      <div className="search-input-section">
        <div className="search-page-input-wrapper">
          <IoSearchOutline size={22} className="search-page-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t.searchPlaceholder}
            className="search-page-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear"
            >
              <IoCloseOutline size={20} />
            </button>
          )}
          <div className="search-divider"></div>
          <button 
            className={`filter-icon-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(true)}
            aria-label="Filters"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="search-bottom-sheet-overlay" onClick={() => setShowFilters(false)}>
          <div className="search-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h2>{language === 'ar-EG' ? 'تصفية النتائج' : 'Filters'}</h2>
              <button className="sheet-close-btn" onClick={() => setShowFilters(false)}>
                <IoCloseOutline size={24} />
              </button>
            </div>
            <div className="sheet-content">
              <div className="filter-group">
                <span className="filter-label">{language === 'ar-EG' ? 'الوسوم (Tags):' : 'Tags:'}</span>
                <div className="search-tags-scroll">
                  <button className={`search-tag-pill ${!selectedTag ? 'active' : ''}`} onClick={() => setSelectedTag('')}>{t.all}</button>
                  {allTags.map((tag: any) => (
                    <button key={tag} className={`search-tag-pill ${selectedTag === tag ? 'active' : ''}`} onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-label">{language === 'ar-EG' ? 'السعر:' : 'Price:'}</span>
                <div className="filter-options">
                  <button className={`filter-opt ${priceFilter === 'all' ? 'active' : ''}`} onClick={() => setPriceFilter('all')}>{t.all}</button>
                  <button className={`filter-opt ${priceFilter === 'free' ? 'active' : ''}`} onClick={() => setPriceFilter('free')}>{t.free}</button>
                  <button className={`filter-opt ${priceFilter === 'paid' ? 'active' : ''}`} onClick={() => setPriceFilter('paid')}>{language === 'ar-EG' ? 'مدفوع' : 'Paid'}</button>
                  <button className={`filter-opt ${priceFilter === 'custom' ? 'active' : ''}`} onClick={() => setPriceFilter('custom')}>{language === 'ar-EG' ? 'مخصص' : 'Custom'}</button>
                </div>
                {priceFilter === 'custom' && (
                  <div className="custom-price-inputs" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input type="number" placeholder={language === 'ar-EG' ? 'من' : 'From'} value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} className="price-input" />
                    <input type="number" placeholder={language === 'ar-EG' ? 'إلى' : 'To'} value={priceTo} onChange={(e) => setPriceTo(e.target.value)} className="price-input" />
                  </div>
                )}
              </div>

              <div className="filter-group">
                <span className="filter-label">{language === 'ar-EG' ? 'النوع:' : 'Type:'}</span>
                <div className="filter-options">
                  <button className={`filter-opt ${typeFilter === 'all' ? 'active' : ''}`} onClick={() => setTypeFilter('all')}>{t.all}</button>
                  <button className={`filter-opt ${typeFilter === 'onsite' ? 'active' : ''}`} onClick={() => setTypeFilter('onsite')}>{language === 'ar-EG' ? 'في الموقع' : 'Onsite'}</button>
                  <button className={`filter-opt ${typeFilter === 'online' ? 'active' : ''}`} onClick={() => setTypeFilter('online')}>{language === 'ar-EG' ? 'أونلاين' : 'Online'}</button>
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-label">{t.targetAudience}:</span>
                <div className="filter-options">
                  <button className={`filter-opt ${genderFilter === 'all' ? 'active' : ''}`} onClick={() => setGenderFilter('all')}>{t.everyone}</button>
                  <button className={`filter-opt ${genderFilter === 'male' ? 'active' : ''}`} onClick={() => setGenderFilter('male')}>{t.malesOnly}</button>
                  <button className={`filter-opt ${genderFilter === 'female' ? 'active' : ''}`} onClick={() => setGenderFilter('female')}>{t.femalesOnly}</button>
                </div>
              </div>
            </div>
            <div className="sheet-footer">
              <button className="sheet-apply-btn" onClick={() => setShowFilters(false)}>
                {language === 'ar-EG' ? 'تطبيق' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results / Suggestions */}
      <div className="search-page-results">
        {loading ? (
          <div className="feed-container" style={{ padding: 0 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : (!hasSearched && !searchQuery.trim() && !hasActiveFilters) ? (
          <div className="suggestions-state">
            <h3 className="suggestions-title">{language === 'ar-EG' ? 'مقترحات لك' : 'Suggestions for you'}</h3>
            <div className="feed-container" style={{ padding: 0 }}>
              {suggestions.map((event) => (
                <EventCard 
                  key={event.id} 
                  id={event.id}
                  title={event.title}
                  image={event.image_url || event.image}
                  location={event.location}
                  date={event.date}
                  endDate={event.end_date}
                  price={event.price === 0 ? t.free : event.price}
                  attendingCount={event.attendees_count || 0}
                  attendingAvatars={event.attending_avatars || []}
                  isOnline={event.is_online}
                />
              ))}
            </div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <p className="search-results-count">
              {filteredEvents.length}{" "}
              {language === "ar-EG" ? "نتيجة" : filteredEvents.length === 1 ? "result" : "results"}
            </p>
            <div className="feed-container" style={{ padding: 0 }}>
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  id={event.id}
                  title={event.title}
                  image={event.image_url || event.image}
                  location={event.location}
                  date={event.date}
                  endDate={event.end_date}
                  price={event.price === 0 ? t.free : event.price}
                  attendingCount={event.attendees_count || 0}
                  attendingAvatars={event.attending_avatars || []}
                  isOnline={event.is_online}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="search-empty-state">
            <div className="search-empty-icon-wrapper">
              <IoSearchOutline size={48} />
            </div>
            <p className="search-empty-title">
              {language === "ar-EG" ? "مفيش نتائج" : "No results found"}
            </p>
            <p className="search-empty-subtitle">
              {language === "ar-EG"
                ? (hasActiveFilters && !searchQuery.trim() ? "لا توجد فعاليات تطابق الفلاتر المحددة" : `مفيش نتائج لـ "${searchQuery}"`)
                : (hasActiveFilters && !searchQuery.trim() ? "No events match the selected filters" : `No results for "${searchQuery}"`)}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .search-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--background);
        }

        .search-page-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--background);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .search-page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--foreground);
          margin: 0;
        }

        .search-input-section {
          padding: 0 16px 16px;
          position: sticky;
          top: 72px;
          background: var(--background);
          z-index: 49;
          border-bottom: 1px solid var(--border);
        }

        .search-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: var(--foreground);
          transition: var(--transition-fast);
          flex-shrink: 0;
        }

        .search-back-btn:hover {
          background: var(--card-background);
        }

        .search-page-input-wrapper {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--input-background);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0 16px;
          height: 52px;
          transition: var(--transition);
        }

        .search-page-input-wrapper:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-transparent);
        }

        .search-page-icon {
          color: var(--secondary-text);
          flex-shrink: 0;
        }

        .search-page-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--foreground);
          font-size: 16px;
          font-family: inherit;
          outline: none;
          height: 100%;
          min-width: 0;
        }

        .search-page-input::placeholder {
          color: var(--gray);
        }

        .search-clear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          color: var(--secondary-text);
          transition: var(--transition-fast);
          flex-shrink: 0;
        }

        .search-divider {
          width: 1px;
          height: 24px;
          background: var(--border);
          margin: 0 4px;
        }

        .filter-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary-text);
          background: transparent;
          border: none;
          padding: 4px;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .filter-icon-btn.active {
          color: var(--primary);
        }

        /* Bottom Sheet Styles */
        .search-bottom-sheet-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 100;
          display: flex;
          align-items: flex-end;
          animation: fadeIn 0.2s ease-out forwards;
        }

        .search-bottom-sheet {
          background: var(--card-background);
          width: 100%;
          max-height: 90vh;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1) forwards;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }

        .sheet-header h2 {
          margin: 0;
          font-size: 18px;
          color: var(--foreground);
        }

        .sheet-close-btn {
          background: transparent;
          border: none;
          color: var(--secondary-text);
          cursor: pointer;
        }

        .sheet-content {
          padding: 20px 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sheet-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border);
        }

        .sheet-apply-btn {
          width: 100%;
          background: var(--primary);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .price-input {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
          color: var(--foreground);
          width: 100px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .search-tags-scroll {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          flex-wrap: wrap;
        }

        .search-tag-pill {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 13px;
          color: var(--foreground);
          white-space: nowrap;
          cursor: pointer;
        }

        .search-tag-pill.active {
          background: var(--foreground);
          color: var(--background);
          border-color: var(--foreground);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-label {
          font-size: 15px;
          font-weight: 600;
          color: var(--foreground);
        }

        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .filter-opt {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 8px 16px;
          font-size: 14px;
          color: var(--foreground);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-opt.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .search-page-results {
          flex: 1;
          padding: 16px;
          padding-bottom: 100px;
        }

        .suggestions-title {
          font-size: 18px;
          margin-bottom: 16px;
          color: var(--foreground);
        }

        .search-results-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-results-count {
          color: var(--secondary-text);
          font-size: 14px;
          margin-bottom: 8px;
          padding-inline-start: 4px;
        }

        .search-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
          gap: 12px;
        }

        .search-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--card-background);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary-text);
          margin-bottom: 8px;
        }

        .search-empty-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--foreground);
        }

        .search-empty-subtitle {
          font-size: 14px;
          color: var(--secondary-text);
          max-width: 280px;
        }

        @media (min-width: 769px) {
          .search-page-header, .search-input-section {
            padding: 20px 40px;
          }
          .search-page-results {
            padding: 24px 40px;
          }
          .search-page-input-wrapper {
            max-width: 600px;
          }
          .search-bottom-sheet {
            max-width: 500px;
            margin: 0 auto;
            max-height: 80vh;
            border-radius: 24px;
            margin-bottom: 40px;
          }
          .search-bottom-sheet-overlay {
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
