"use client";

import { useEffect, useState, useRef } from "react";
import { IoSearchOutline, IoCloseOutline, IoArrowBack } from "react-icons/io5";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/language-context";
import { SearchResult } from "@/components/SearchResult";
import { SearchResultSkeleton } from "@/components/SearchResultSkeleton";
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
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
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
          const mappedEvents = eventsData.map((event) => ({
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

    // 4. Target Audience Filter
    if (genderFilter !== "all" && event.gender !== genderFilter) return false;

    return true;
  });

  const allTags = Array.from(new Set(events.flatMap(e => e.tags)));

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
          <IoArrowBack size={22} />
        </button>
        <div className="search-page-input-wrapper">
          <IoSearchOutline size={20} className="search-page-icon" />
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
        </div>
      </div>

      {/* Filters Bar */}
      <div className="search-filters-bar">
        <button 
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          {language === 'ar-EG' ? 'تصفية النتائج' : 'Filters'}
        </button>
        <div className="search-tags-scroll">
          <button 
            className={`search-tag-pill ${!selectedTag ? 'active' : ''}`}
            onClick={() => setSelectedTag('')}
          >
            {t.all}
          </button>
          {allTags.map((tag: any) => (
            <button 
              key={tag}
              className={`search-tag-pill ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {showFilters && (
        <div className="search-expanded-filters">
          <div className="filter-group">
            <span className="filter-label">{language === 'ar-EG' ? 'السعر:' : 'Price:'}</span>
            <div className="filter-options">
              <button className={`filter-opt ${priceFilter === 'all' ? 'active' : ''}`} onClick={() => setPriceFilter('all')}>{t.all}</button>
              <button className={`filter-opt ${priceFilter === 'free' ? 'active' : ''}`} onClick={() => setPriceFilter('free')}>{t.free}</button>
              <button className={`filter-opt ${priceFilter === 'paid' ? 'active' : ''}`} onClick={() => setPriceFilter('paid')}>{language === 'ar-EG' ? 'مدفوع' : 'Paid'}</button>
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
      )}

      {/* Results */}
      <div className="search-page-results">
        {loading ? (
          <div className="search-results-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <SearchResultSkeleton key={i} />
            ))}
          </div>
        ) : !hasSearched || !searchQuery.trim() ? (
          <div className="search-empty-state">
            <div className="search-empty-icon-wrapper">
              <IoSearchOutline size={48} />
            </div>
            <p className="search-empty-title">{t.searchPlaceholder.split(",")[0]}</p>
            <p className="search-empty-subtitle">
              {language === "ar-EG"
                ? "ابحث عن فعاليات، أماكن، أو وسوم"
                : "Find events by name, location, or tags"}
            </p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="search-results-list">
            <p className="search-results-count">
              {filteredEvents.length}{" "}
              {language === "ar-EG" ? "نتيجة" : filteredEvents.length === 1 ? "result" : "results"}
            </p>
            {filteredEvents.map((event, index) => (
              <SearchResult key={event.id} event={event} index={index} />
            ))}
          </div>
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
                ? `مفيش نتائج لـ "${searchQuery}"`
                : `No results for "${searchQuery}"`}
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
          border-bottom: 1px solid var(--border);
          background: var(--background);
          position: sticky;
          top: 0;
          z-index: 50;
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
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--input-background);
          border: 1px solid var(--border);
          border-radius: 25px;
          padding: 0 16px;
          height: 48px;
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

        .search-clear-btn:hover {
          background: var(--dark-gray);
          color: var(--foreground);
        }

        .search-filters-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--background);
        }

        .filter-toggle-btn {
          background: var(--card-background);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--foreground);
          cursor: pointer;
          flex-shrink: 0;
        }

        .filter-toggle-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .search-tags-scroll {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .search-tags-scroll::-webkit-scrollbar {
          display: none;
        }

        .search-tag-pill {
          background: var(--card-background);
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

        .search-expanded-filters {
          padding: 16px;
          background: var(--card-background);
          border-bottom: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--secondary-text);
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
          padding: 6px 16px;
          font-size: 13px;
          color: var(--foreground);
          cursor: pointer;
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

        .search-results-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
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
          .search-page-header {
            padding: 20px 40px;
          }
          .search-page-results {
            padding: 24px 40px;
            max-width: 800px;
          }
          .search-page-input-wrapper {
            max-width: 600px;
          }
        }
      `}</style>
    </div>
  );
}
