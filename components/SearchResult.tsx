"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IoLocationSharp, IoCalendarSharp, IoCloseCircle, IoEllipsisVertical, IoShareSocialOutline, IoBan, IoGlobeOutline } from "react-icons/io5";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { shareEvent } from "@/lib/share";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface SearchResultProps {
  event: any;
  index: number;
}

export function SearchResult({ event, index }: SearchResultProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t, localizeHref, language } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const isPast = event.end_date 
    ? new Date(`${event.end_date}T${event.end_time || '23:59:59'}`) < new Date()
    : new Date(`${event.date}T${event.time || '23:59:59'}`) < new Date();

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      setCancelError(language === 'ar-EG' ? "يرجى كتابة سبب الإلغاء" : "Please provide a reason for cancellation");
      return;
    }
    
    setIsCanceling(true);
    setCancelError("");
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'canceled', cancellation_reason: cancelReason.trim() })
        .eq('id', event.id);
        
      if (error) throw error;
      
      showToast(language === 'ar-EG' ? "تم إلغاء الفعالية بنجاح" : "Event canceled successfully", "success");
      setShowCancelModal(false);
      // Wait a moment before reloading to show the toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error("Error canceling event:", err);
      setCancelError(err.message || "Failed to cancel event");
    } finally {
      setIsCanceling(false);
    }
  };

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
      <Link href={localizeHref(`/event/${event.id}`)} className="sr-card-link-wrapper">
        <div className="search-result-image-wrapper">
          <img 
            key={event.image_url || event.image || 'placeholder'}
            src={imgError || !(event.image_url || event.image) ? "/placeholder-event.svg" : (event.image_url || event.image)} 
            alt={event.title}
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
                  {user?.id === event.organizer_id && event.status !== 'canceled' && !isPast && (
                    <button 
                      className="sr-dropdown-item dropdown-cancel"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu(false);
                        setShowCancelModal(true);
                        setCancelError("");
                        setCancelReason("");
                      }}
                    >
                      <IoBan size={14} />
                      <span>{t.cancel}</span>
                    </button>
                  )}
                  <button 
                    className="sr-dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(false);
                      shareEvent({ id: event.id, title: event.title });
                    }}
                  >
                    <IoShareSocialOutline size={14} />
                    <span>{t.share}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="sr-info-row-flex">
            <div className="sr-info-item">
              <IoCalendarSharp size={14} className="sr-icon" color="var(--accent)" />
              <span className="sr-info-text">
                {event.end_date ? `${event.date} - ${event.end_date}` : event.date}
              </span>
            </div>
            <div className="sr-info-item">
              {(event.is_online || event.location?.toLowerCase() === "online") ? <IoGlobeOutline size={14} className="sr-icon" color="var(--accent)" /> : <IoLocationSharp size={14} className="sr-icon" color="var(--accent)" />}
              <span className="sr-info-text">
                {(event.is_online || event.location?.toLowerCase() === "online") ? t.online : event.location}
              </span>
            </div>
          </div>

          <div className="sr-footer">
            <span className="sr-price">
              {event.price === 0 || String(event.price).toLowerCase() === "free" 
                ? t.free 
                : `${typeof event.price === 'number' ? Math.abs(event.price) : event.price} ${t.egp}`}
            </span>
            
            <div className="sr-badges">
              {event.status === 'canceled' ? (
                <div className="sr-badge sr-badge-canceled">
                  <IoCloseCircle size={12} />
                  <span>{t.canceled || "Canceled"}</span>
                </div>
              ) : isPast ? (
                <div className="sr-badge sr-badge-finished" style={{ background: 'var(--gray)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <IoBan size={12} />
                  <span>{language === 'ar-EG' ? 'منتهي' : 'Finished'}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Link>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="cancel-modal-overlay" onClick={() => setShowCancelModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="cancel-modal" onClick={e => e.stopPropagation()} style={{ background: 'var(--card-background)', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, color: 'var(--foreground)' }}>{language === 'ar-EG' ? 'هل تريد إلغاء الفعالية؟' : 'Do you want to cancel event?'}</h3>
            <div>
              <label style={{ fontSize: '14px', color: 'var(--secondary-text)', marginBottom: '8px', display: 'block' }}>
                {language === 'ar-EG' ? 'سبب الإلغاء:' : 'Reason of cancellation:'}
              </label>
              <textarea 
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-background)', color: 'var(--foreground)' }}
                placeholder={language === 'ar-EG' ? 'اكتب السبب هنا...' : 'Write reason here...'}
              />
              {cancelError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', marginBottom: 0 }}>{cancelError}</p>}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                onClick={() => setShowCancelModal(false)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontWeight: 500 }}
              >
                {language === 'ar-EG' ? 'لا' : 'No'}
              </button>
              <button 
                onClick={handleCancelConfirm}
                disabled={isCanceling}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 500, opacity: isCanceling ? 0.7 : 1 }}
              >
                {isCanceling ? (language === 'ar-EG' ? 'جاري الإلغاء...' : 'Canceling...') : (language === 'ar-EG' ? 'نعم' : 'Yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
