"use client";

import { shareEvent } from "@/lib/share";
import { useLanguage } from "@/lib/language-context";
import { IoCalendarSharp, IoLocationSharp, IoShareSocialOutline, IoGlobeOutline } from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface EventCardProps {
  id: string;
  title: string;
  image: string;
  location: string;
  date: string;
  endDate?: string;
  price: string | number;
  attendingCount?: number;
  attendingAvatars?: string[];
}

export function EventCard({ 
  id, 
  title, 
  image, 
  location, 
  date, 
  endDate,
  price, 
  attendingCount = 0,
  attendingAvatars = [],
}: EventCardProps) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    shareEvent({ id, title });
  };

  const displayLocation = location?.toLowerCase() === "online" ? t.online : location;
  const displayPrice = typeof price === "number" ? Math.abs(price) : price;

  return (
    <Link href={`/explore/${id}`} className="event-card-link">
      <div className="event-card">
        <div className="event-card-image-container">
          <Image 
            src={imgError ? "https://images.unsplash.com/photo-1540575467063-178a50c2df8b?auto=format&fit=crop&q=80&w=2000" : (image || "https://images.unsplash.com/photo-1540575467063-178a50c2df8b?auto=format&fit=crop&q=80&w=2000")} 
            alt={title} 
            fill 
            className="event-card-image"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setImgError(true)}
          />
          <button 
            className="event-card-share" 
            aria-label={t.share}
            onClick={handleShare}
          >
            <IoShareSocialOutline size={16} />
          </button>
        </div>

        <div className="event-card-content">
          
          <h3 className="event-card-title">{title}</h3>
          
          <div className="event-card-info-row">
            <div className="event-card-info-item">
              {location?.toLowerCase() === "online" ? <IoGlobeOutline size={16} /> : <IoLocationSharp size={16} />}
              <span className="event-card-info-text">{displayLocation}</span>
            </div>
            <div className="event-card-info-item">
              <IoCalendarSharp size={16} />
              <span className="event-card-info-text">
                {endDate ? `${date} - ${endDate}` : date}
              </span>
            </div>
          </div>

          <div className="event-card-footer">
            <div className="event-card-price">
              {displayPrice === 0 || String(displayPrice).toLowerCase() === "free" 
                ? t.free 
                : `${displayPrice} ${t.egp}`}
            </div>
            
            <div className="event-card-avatars-container">
              {attendingCount > 0 && (
                <span className="event-card-attending-count">
                  +{attendingCount}
                </span>
              )}
              <div className="event-card-avatars">
                {attendingAvatars?.map((avatar, i) => (
                  <div key={i} className="avatar-wrapper" style={{ zIndex: attendingAvatars.length - i }}>
                    <Image 
                      src={avatar}
                      alt={`${t.attending} ${i+1}`}
                      width={30}
                      height={30}
                      className="event-card-avatar"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
