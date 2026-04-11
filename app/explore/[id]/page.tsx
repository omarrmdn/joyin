"use client";
import { TopBar } from "@/components/TopBar";
import { shareEvent } from "@/lib/share";
import {
  IoCalendarSharp,
  IoChevronBack,
  IoTimeOutline,
  IoHeartOutline,
  IoLocationSharp,
  IoShareSocialOutline
} from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { 
  IoFlagOutline, 
  IoClose, 
  IoCameraOutline, 
  IoCheckmarkCircle,
  IoAlertCircleOutline
} from "react-icons/io5";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

interface EventDetailsProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailsPage({ params }: EventDetailsProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
        
        if (data) {
          setEvent(data);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  const activeEvent = event || {
    title: "Loading...",
    image: "",
    location: "Loading...",
    date: "...",
    price: "0",
    description: "...",
    host: { name: "...", avatar: "" },
    tags: [],
    attendees_count: 0
  };

  const currentEvent = activeEvent;

  // Join Logic State
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Mock joined events for overlap check
  const myJoinedEvents = [
    {
      id: "m2",
      title: "UI/UX Masterclass",
      date: "Tuesday, Dec 15, 2026",
      time: "2:00 PM - 5:00 PM",
    }
  ];

  const handleJoin = async () => {
    if (isJoined || isJoining) return;
    
    setIsJoining(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));

    // Improved overlap check for web mock data
    const parseWebDateTime = (dateStr: string, timeStr: string) => {
      try {
        // Browsers can usually parse "July 15, 2026 4:00 PM"
        // But need to handle "Thursday, Dec 10, 2026" by removing the day name
        const cleanDate = dateStr.includes(",") && dateStr.split(",").length > 2 
          ? dateStr.substring(dateStr.indexOf(",") + 1).trim() // Remove day name
          : dateStr;
        
        return new Date(`${cleanDate} ${timeStr}`).getTime();
      } catch (e) {
        return NaN;
      }
    };

    const newStart = parseWebDateTime(currentEvent.date, currentEvent.time);
    const newEnd = parseWebDateTime(currentEvent.endDate || currentEvent.date, currentEvent.endTime || currentEvent.time);

    if (!isNaN(newStart) && !isNaN(newEnd)) {
      const overlap = myJoinedEvents.find(je => {
        const eStart = parseWebDateTime(je.date, je.time);
        const eEnd = parseWebDateTime((je as any).endDate || je.date, (je as any).endTime || je.time);
        if (isNaN(eStart) || isNaN(eEnd)) return false;
        return newStart < eEnd && newEnd > eStart;
      });

      if (overlap) {
        alert(`Overlap Conflict: You are already attending "${overlap.title}" at this time.`);
        setIsJoining(false);
        return;
      }
    }

    setIsJoined(true);
    setIsJoining(false);
  };

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [reportImages, setReportImages] = useState<string[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (reportImages.length + files.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }
    const newImages = files.map(f => URL.createObjectURL(f));
    setReportImages(prev => [...prev, ...newImages]);
  };

  const handleReportSubmit = async () => {
    if (!reportDescription.trim()) return;
    setIsSubmittingReport(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmittingReport(false);
    setReportSuccess(true);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setReportSuccess(false);
      setReportDescription("");
      setReportImages([]);
    }, 2000);
  };

  return (
    <>
      <div className="topbar-wrapper">
        <TopBar />
      </div>
      
      <div className="event-details-lux-container">
        {/* Header Actions */}
        <div className="ed-header-nav">
          <Link href="/" className="ed-back-btn">
            <IoChevronBack size={24} className="rtl-flip" />
            <span>Back</span>
          </Link>
          <div className="ed-header-actions">
            <button 
              className="ed-action-icon-btn"
              onClick={() => shareEvent({ id: currentEvent.id, title: currentEvent.title })}
            >
              <IoShareSocialOutline size={20} />
            </button>
            <button className="ed-action-icon-btn"><IoHeartOutline size={20} /></button>
            <button 
              className="ed-action-icon-btn"
              onClick={() => setIsReportModalOpen(true)}
              title="Report Event"
            >
              <IoFlagOutline size={20} />
            </button>
          </div>
        </div>

        <div className="ed-content-layout">
          {/* Left Column: Visuals & Main Content */}
          <div className="ed-main-column">
            <div className="ed-hero-image-wrapper">
              <Image 
                src={currentEvent.image_url || currentEvent.image || ""} 
                alt={currentEvent.title} 
                fill 
                className="ed-hero-image"
                priority
              />
              <div className="ed-image-overlay" />
            </div>

            <div className="ed-info-body">
              <h1 className="ed-title">{currentEvent.title}</h1>
              
              <div className="ed-quick-host-info-row">
                <div className="ed-quick-host-info">
                  <Image 
                    src={currentEvent.host?.avatar || "https://i.pravatar.cc/150"} 
                    alt={currentEvent.host?.name || "Host"} 
                    width={32} 
                    height={32} 
                    className="ed-mini-host-avatar"
                  />
                  <span className="ed-host-name-mini">{currentEvent.host?.name || "Organizer"}</span>
                </div>

                <div className="ed-attending-group-mini">
                   <span className="ed-attending-text-mini">{currentEvent.attendees_count || 0}+ attending</span>
                   <div className="ed-avatar-stack-mini">
                     {[1,2,3].map(i => (
                       <div key={i} className="ed-stack-avatar-box-mini">
                         <Image 
                           src={`https://i.pravatar.cc/100?u=${i}`} 
                           alt="Attendee" 
                           width={28} 
                           height={28} 
                         />
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              <div className="ed-tags-wrapper">
                {currentEvent.tags?.map((tag: string) => (
                  <span key={tag} className="ed-pill-tag">{tag}</span>
                ))}
              </div>

              <div className="ed-section">
                <h2 className="ed-section-title">About the event</h2>
                <p className="ed-description">{currentEvent.description}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Key Details & Booking (Sidebar style) */}
          <div className="ed-side-column">
            <div className="ed-ticket-card glass-lux">
              <div className="ed-price-row-lux">
                <span className="ed-price-value-lux">
                  {currentEvent.price === 0 || currentEvent.price === "Free" ? "Free" : `${currentEvent.price} EGP`}
                </span>
                {String(currentEvent.price).toLowerCase() === "free" && (
                  <div className="ed-free-notice">
                    <IoAlertCircleOutline size={22} className="ed-free-icon" />
                    <p className="ed-free-notice-text">
                      This event is free. If the organizer asks for money, please{" "}
                      <button 
                        className="ed-report-link"
                        onClick={() => setIsReportModalOpen(true)}
                      >
                        report it
                      </button>{" "}
                      to remove the event.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="ed-details-list">
                <div className="ed-detail-item">
                  <div className="ed-detail-icon-box">
                    <IoCalendarSharp size={20} />
                  </div>
                  <div className="ed-detail-text">
                    <span className="ed-detail-title">Date</span>
                    <span className="ed-detail-value">
                      {currentEvent.end_date ? `${currentEvent.date} - ${currentEvent.end_date}` : currentEvent.date}
                    </span>
                  </div>
                </div>

                <div className="ed-detail-item">
                  <div className="ed-detail-icon-box">
                    <IoTimeOutline size={20} />
                  </div>
                  <div className="ed-detail-text">
                    <span className="ed-detail-title">Time</span>
                    <span className="ed-detail-value">
                      {currentEvent.end_time ? `${currentEvent.start_time || currentEvent.time} - ${currentEvent.end_time}` : (currentEvent.start_time || currentEvent.time)}
                    </span>
                  </div>
                </div>

                <div className="ed-detail-item">
                  <div className="ed-detail-icon-box">
                    <IoLocationSharp size={20} />
                  </div>
                  <div className="ed-detail-text">
                    <span className="ed-detail-title">Location</span>
                    <span className="ed-detail-value">{currentEvent.location}</span>
                  </div>
                </div>
              </div>

              <button 
                className={`ed-join-btn ${isJoined ? 'joined' : ''}`}
                onClick={handleJoin}
                disabled={isJoining || isJoined}
              >
                {isJoining ? "Joining..." : isJoined ? "Joined" : "Join"}
              </button>
              
              <p className="ed-hint">Secure your spot before it's full!</p>
              

            </div>
          </div>
        </div>
      </div>
      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="report-modal-overlay" onClick={() => setIsReportModalOpen(false)}>
          <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="report-modal-close" onClick={() => setIsReportModalOpen(false)}>
              <IoClose size={20} />
            </button>

            {reportSuccess ? (
              <div className="report-success-state">
                <IoCheckmarkCircle size={60} className="report-success-icon" />
                <h2 className="report-modal-title">Report Submitted</h2>
                <p className="report-modal-subtitle">Thank you. Our team will review this event shortly.</p>
              </div>
            ) : (
              <>
                <h2 className="report-modal-title">Report a Problem</h2>
                <p className="report-modal-subtitle">Help us understand what's wrong with this event.</p>

                <div className="report-form-group">
                  <label className="report-modal-label">What is the issue?</label>
                  <textarea 
                    className="report-modal-textarea"
                    placeholder="Describe the problem in detail (e.g. fake event, inappropriate content, etc.)"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                  />
                </div>

                <div className="report-form-group">
                  <label className="report-modal-label">Screenshots (Optional, up to 3)</label>
                  <div className="report-images-row">
                    {reportImages.map((img, idx) => (
                      <div key={idx} className="report-img-prev">
                        <img src={img} alt="preview" />
                        <button 
                          className="report-img-remove"
                          onClick={() => setReportImages(reportImages.filter((_, i) => i !== idx))}
                        >
                          <IoClose size={12} />
                        </button>
                      </div>
                    ))}
                    {reportImages.length < 3 && (
                      <label className="report-upload-btn">
                        <IoCameraOutline size={28} />
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={handleImageUpload}
                          style={{ display: 'none' }} 
                        />
                      </label>
                    )}
                  </div>
                </div>

                <button 
                  className="report-modal-submit"
                  disabled={!reportDescription.trim() || isSubmittingReport}
                  onClick={handleReportSubmit}
                >
                  {isSubmittingReport ? "Submitting..." : "Send Report"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
