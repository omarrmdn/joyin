"use client";
import { TopBar } from "@/components/TopBar";
import { shareEvent } from "@/lib/share";
import { useLanguage } from "@/lib/language-context";
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
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            users:organizer_id (
              name,
              image_url
            ),
            event_tags (
              tags (
                name
              )
            )
          `)
          .eq('id', eventId)
          .single();
        
        if (data) {
          // Flatten tags
          const mappedEvent = {
            ...data,
            host: data.users ? { name: data.users.name, avatar: data.users.image_url } : null,
            tags: data.event_tags?.map((et: any) => et.tags?.name).filter(Boolean) || []
          };
          setEvent(mappedEvent);

          // Check if user is already joined
          if (user) {
            const { data: attendance } = await supabase
              .from('attendees')
              .select('*')
              .eq('event_id', eventId)
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (attendance) setIsJoined(true);
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId, user]);

  const activeEvent = event || {
    title: t.loading,
    image: "",
    location: t.loading,
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

  const handleJoin = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (isJoined || isJoining) return;
    
    setIsJoining(true);
    try {
       // 1. Real Join via Attendees table
       const { error: joinError } = await supabase
         .from('attendees')
         .insert({
           event_id: eventId,
           user_id: user.id
         });

       if (joinError) throw joinError;

       setIsJoined(true);
    } catch (error: any) {
       console.error("Join error:", error);
       alert(`Failed to join: ${error.message}`);
    } finally {
       setIsJoining(false);
    }
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
      alert(t.maxImagesAllowed);
      return;
    }
    const newImages = files.map(f => URL.createObjectURL(f));
    setReportImages(prev => [...prev, ...newImages]);
  };

  const handleReportSubmit = async () => {
    if (!reportDescription.trim()) return;
    setIsSubmittingReport(true);
    try {
      // 1. Upload images if any
      const uploadedImages: string[] = [];
      // (Simplified: real upload logic would iterate reportImages and upload to Storage)
      
      // 2. Insert into bug_reports table
      const { error: reportError } = await supabase
        .from('bug_reports')
        .insert({
          description: `Event Report for ${eventId}: ${reportDescription}`,
          images: uploadedImages,
          user_id: user?.id || null,
          status: 'open'
        });

      if (reportError) throw reportError;

      setReportSuccess(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
        setReportDescription("");
        setReportImages([]);
      }, 2000);
    } catch (error: any) {
      console.error("Report submission error:", error);
      alert(`Failed to submit report: ${error.message}`);
    } finally {
      setIsSubmittingReport(false);
    }
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
            <span>{t.back}</span>
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
              title={t.reportEvent}
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
                    alt={currentEvent.host?.name || t.organizer} 
                    width={32} 
                    height={32} 
                    className="ed-mini-host-avatar"
                  />
                  <span className="ed-host-name-mini">{currentEvent.host?.name || t.organizer}</span>
                </div>

                <div className="ed-attending-group-mini">
                   <span className="ed-attending-text-mini">{currentEvent.attendees_count || 0}+ {t.attending}</span>
                   <div className="ed-avatar-stack-mini">
                     {[1,2,3].map(i => (
                       <div key={i} className="ed-stack-avatar-box-mini">
                         <Image 
                           src={`https://i.pravatar.cc/100?u=${i}`} 
                           alt={t.attending} 
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
                <h2 className="ed-section-title">{t.aboutTheEvent}</h2>
                <p className="ed-description">{currentEvent.description}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Key Details & Booking (Sidebar style) */}
          <div className="ed-side-column">
            <div className="ed-ticket-card glass-lux">
              <div className="ed-price-row-lux">
                <span className="ed-price-value-lux">
                  {currentEvent.price === 0 || String(currentEvent.price).toLowerCase() === "free" 
                    ? t.free 
                    : `${typeof currentEvent.price === 'number' ? Math.abs(currentEvent.price) : currentEvent.price} ${t.egp}`}
                </span>
                {String(currentEvent.price).toLowerCase() === "free" && (
                  <div className="ed-free-notice">
                    <IoAlertCircleOutline size={22} className="ed-free-icon" />
                    <p className="ed-free-notice-text">
                      {t.freeEventNotice}{" "}
                      <button 
                        className="ed-report-link"
                        onClick={() => setIsReportModalOpen(true)}
                      >
                        {t.reportIt}
                      </button>{" "}
                      {t.toRemoveEvent}
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
                    <span className="ed-detail-title">{t.date}</span>
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
                    <span className="ed-detail-title">{t.time}</span>
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
                    <span className="ed-detail-title">{t.location}</span>
                    <span className="ed-detail-value">
                      {currentEvent.location?.toLowerCase() === "online" ? t.online : currentEvent.location}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                className={`ed-join-btn ${isJoined ? 'joined' : ''}`}
                onClick={handleJoin}
                disabled={isJoining || isJoined}
              >
                {isJoining ? t.joining : isJoined ? t.joined : t.join}
              </button>
              
              <p className="ed-hint">{t.secureSpot}</p>
              

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
                <h2 className="report-modal-title">{t.reportSubmitted}</h2>
                <p className="report-modal-subtitle">{t.reportThankYou}</p>
              </div>
            ) : (
              <>
                <h2 className="report-modal-title">{t.reportProblem}</h2>
                <p className="report-modal-subtitle">{t.reportSubtitle}</p>

                <div className="report-form-group">
                  <label className="report-modal-label">{t.whatIsTheIssue}</label>
                  <textarea 
                    className="report-modal-textarea"
                    placeholder={t.reportPlaceholder}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                  />
                </div>

                <div className="report-form-group">
                  <label className="report-modal-label">{t.screenshotsOptional}</label>
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
                  {isSubmittingReport ? t.submitting : t.sendReport}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
