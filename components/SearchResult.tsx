"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IoLocationSharp, IoCalendarSharp, IoCloseCircle, IoEllipsisVertical, IoShareSocialOutline, IoBan, IoGlobeOutline } from "react-icons/io5";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface SearchResultProps {
  event: any;
  index: number;
}

export function SearchResult({ event, index }: SearchResultProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div 
      className={`search-result-item ${event.status === 'canceled' ? 'canceled' : ''}`} 
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link href={`/explore/${event.id}`} className="sr-card-link-wrapper">
        <div className="search-result-image-wrapper">
          <Image 
            src={imgError ? "https://images.unsplash.com/photo-1540575467063-178a50c2df8b?auto=format&fit=crop&q=80&w=2000" : (event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df8b?auto=format&fit=crop&q=80&w=2000")} 
            alt={event.title}
            fill
            className="search-result-image"
            onError={() => setImgError(true)}
          />
          {event.status === 'canceled' && <div className="canceled-overlay" />}
        </div>

        <div className="search-result-content">
          <div className="sr-title-row">
            <h3 className="sr-title">{event.title}</h3>
            <div className="sr-actions-container" ref={menuRef}>
              <button 
                className="sr-options-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <IoEllipsisVertical size={18} />
              </button>
              
              {showMenu && (
                <div className="sr-dropdown-menu">
                  <button 
                    className="sr-dropdown-item dropdown-cancel"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  >
                    <IoBan size={14} />
                    <span>{t.cancel}</span>
                  </button>
                  <button 
                    className="sr-dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  >
                    <IoShareSocialOutline size={14} />
                    <span>{t.share}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="sr-info-row">
            <div className="sr-info-item">
              {event.location?.toLowerCase() === "online" ? <IoGlobeOutline size={14} className="sr-icon" color="var(--accent)" /> : <IoLocationSharp size={14} className="sr-icon" color="var(--accent)" />}
              <span className="sr-info-text">
                {event.location?.toLowerCase() === "online" ? t.online : event.location}
              </span>
            </div>
            <div className="sr-info-item">
              <IoCalendarSharp size={14} className="sr-icon" color="var(--accent)" />
              <span className="sr-info-text">
                {event.endDate ? `${event.date} - ${event.endDate}` : event.date}
              </span>
            </div>
          </div>

          <div className="sr-footer">
            <span className="sr-price">
              {event.price === 0 || String(event.price).toLowerCase() === "free" 
                ? t.free 
                : `${typeof event.price === 'number' ? Math.abs(event.price) : event.price} ${t.egp}`}
            </span>
            
            {event.status === 'canceled' && (
              <div className="sr-badge sr-badge-canceled">
                <IoCloseCircle size={12} />
                <span>{t.canceled}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
