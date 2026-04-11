"use client";

import { useEffect, useState } from "react";
import { IoCloseOutline, IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";
import { subscribeShareModal, closeShareModal } from "@/lib/share";
import { useLanguage } from "@/lib/language-context";

export function GlobalShareModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [eventData, setEventData] = useState<{ id: string; title: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const unsubscribe = subscribeShareModal((state) => {
      setIsOpen(state.isOpen);
      setEventData(state.event);
      if (!state.isOpen) {
        setCopied(false);
      }
    });
    return unsubscribe;
  }, []);

  if (!isOpen || !eventData) return null;

  const eventUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/explore/${eventData.id}`;
  const message = `I'm going to this 🎟️✨\n**${eventData.title}**\nJoin me on Joyin 📍🔥\n\n${eventUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-modal-overlay" onClick={closeShareModal}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3 className="share-modal-title">{t.shareTitle}</h3>
          <button onClick={closeShareModal} className="share-modal-close">
            <IoCloseOutline size={24} />
          </button>
        </div>
        <div className="share-modal-body">
          <p className="share-event-name">{eventData.title}</p>
          <div className="share-link-box">
            <input type="text" readOnly value={eventUrl} className="share-link-input" />
            <button 
              onClick={handleCopy} 
              className={`share-copy-btn ${copied ? "copied" : ""}`}
              aria-label="Copy link"
            >
              {copied ? <IoCheckmarkOutline size={18} /> : <IoCopyOutline size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
