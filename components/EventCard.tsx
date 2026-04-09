"use client";

import Image from "next/image";
import { 
  MapPin, 
  Calendar, 
  Share2, 
  Users,
  Star
} from "lucide-react";

interface EventCardProps {
  id: string;
  title: string;
  image: string;
  location: string;
  date: string;
  price: string | number;
  attendingCount?: number;
  isPromoted?: boolean;
}

export function EventCard({ 
  id, 
  title, 
  image, 
  location, 
  date, 
  price, 
  attendingCount = 0,
  isPromoted = false 
}: EventCardProps) {
  return (
    <div className={`event-card ${isPromoted ? "promoted" : ""}`}>
      <div className="event-image-container">
        <Image 
          src={image} 
          alt={title} 
          fill 
          className="event-image"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <button className="share-button glass">
          <Share2 size={18} />
        </button>
        {isPromoted && (
          <div className="promoted-badge">
            <Star size={14} fill="currentColor" />
            <span>Featured</span>
          </div>
        )}
      </div>

      <div className="event-info">
        <h3 className="event-title">{title}</h3>
        
        <div className="event-details">
          <div className="detail-item">
            <MapPin size={16} className="detail-icon" />
            <span className="detail-text">{location}</span>
          </div>
          <div className="detail-item">
            <Calendar size={16} className="detail-icon" />
            <span className="detail-text">{date}</span>
          </div>
        </div>

        <div className="event-footer">
          <div className="event-price">
            {typeof price === "number" ? `$${price}` : price}
          </div>
          
          <div className="attending-info">
            <div className="attending-avatars">
               <Users size={16} className="detail-icon" />
               <span className="attending-text">{attendingCount} attending</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .event-card {
          background-color: var(--card-background);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border);
          transition: var(--transition);
          position: relative;
        }

        .event-card:hover {
          transform: translateY(-8px);
          border-color: var(--primary);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        .event-card.promoted {
          border-color: var(--primary);
          background: linear-gradient(to bottom, #1a1a1a, #0d0d0d);
        }

        .event-image-container {
          position: relative;
          width: 100%;
          height: 200px;
        }

        .event-image {
          object-fit: cover;
        }

        .share-button {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 5;
          transition: var(--transition);
        }

        .share-button:hover {
          background: var(--primary);
          transform: scale(1.1);
        }

        .promoted-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--primary);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          z-index: 5;
        }

        .event-info {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .event-title {
          font-size: 1.25rem;
          color: var(--foreground);
          margin-bottom: 0.25rem;
        }

        .event-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--secondary-text);
          font-size: 0.875rem;
        }

        .detail-icon {
          color: var(--primary);
        }

        .event-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .event-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
        }

        .attending-info {
          display: flex;
          align-items: center;
        }

        .attending-text {
          font-size: 0.81rem;
          color: var(--secondary-text);
          margin-left: 0.5rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
