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

interface EventDetailsProps {
  params: Promise<{ id: string }>;
}

// Mock data (matching IDs in Home and MyEventsPage)
const eventsData: Record<string, any> = {
  "1": {
    id: "1",
    title: "Summer Music Festival 2026",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop",
    location: "Central Park, NY",
    date: "July 15, 2026",
    endDate: "July 17, 2026",
    time: "4:00 PM",
    endTime: "11:00 PM",
    price: "$45",
    host: {
      name: "NY Events",
      avatar: "https://i.pravatar.cc/150?u=nyevents",
      role: "Organizer"
    },
    description: "Join us for the biggest summer music festival of 2026! Featuring top artists from around the world. Get ready to experience amazing performances and enjoy a weekend full of music, food, and fun.",
    attendees: 1240,
    tags: ["Music", "Festival", "Summer"]
  },
  "2": {
    id: "2",
    title: "Tech Innovators Summit",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop",
    location: "Convention Center",
    date: "August 02, 2026",
    endDate: "August 05, 2026",
    time: "9:00 AM",
    endTime: "5:00 PM",
    price: "Free",
    host: {
      name: "Tech Hub Community",
      avatar: "https://i.pravatar.cc/150?u=techhub",
      role: "Community Organizer"
    },
    description: "Discover the latest in technology and innovation at the Tech Innovators Summit. Network with industry leaders, attend insightful talks, and explore new startups and cutting-edge products.",
    attendees: 850,
    tags: ["Tech", "Startups", "Networking"]
  },
  "3": {
    id: "3",
    title: "Gourmet Food Expo",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop",
    location: "Downtown Plaza",
    date: "September 12, 2026",
    time: "10:00 AM",
    endTime: "8:00 PM",
    price: "$15",
    host: {
      name: "Culinary Arts",
      avatar: "https://i.pravatar.cc/150?u=culinary",
      role: "Organizer"
    },
    description: "Taste the finest dishes from top chefs at the Gourmet Food Expo. A paradise for food lovers, featuring live cooking demonstrations, exquisite tastings, and a wide variety of global cuisines.",
    attendees: 420,
    tags: ["Food", "Expo", "Gourmet"]
  },
  "4": {
    id: "4",
    title: "Art & Design Workshop",
    image: "https://images.unsplash.com/photo-1460666819844-e2a4d7764ef5?q=80&w=2064&auto=format&fit=crop",
    location: "Modern Art Gallery",
    date: "October 05, 2026",
    time: "1:00 PM",
    endTime: "4:00 PM",
    price: "$30",
    host: {
      name: "Creative Studios",
      avatar: "https://i.pravatar.cc/150?u=studio",
      role: "Design Agency"
    },
    description: "Enhance your creative skills in this interactive Art & Design Workshop. Suitable for all skill levels, you'll learn new techniques in painting, illustration, and digital design from experienced artists.",
    attendees: 150,
    tags: ["Art", "Design", "Workshop"]
  },
  "5": {
    id: "5",
    title: "International Film Festival",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
    location: "Grand Theater",
    date: "November 20, 2026",
    endDate: "November 22, 2026",
    time: "6:00 PM",
    endTime: "11:00 PM",
    price: "$25",
    host: {
      name: "Cinema World",
      avatar: "https://i.pravatar.cc/150?u=cinema",
      role: "Organizer"
    },
    description: "Experience the magic of cinema with acclaimed films from around the globe at the International Film Festival. Join filmmakers, actors, and movie enthusiasts for exclusive screenings and Q&A sessions.",
    attendees: 2100,
    tags: ["Film", "Festival", "Art"]
  },
  "6": {
    id: "6",
    title: "Global AI & Robotics Expo",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop",
    location: "Exhibition Hall, WA",
    date: "Dec 10, 2026",
    endDate: "Dec 25, 2026",
    time: "9:00 AM",
    endTime: "6:00 PM",
    price: "$150",
    host: {
      name: "Tech Hub Community",
      avatar: "https://i.pravatar.cc/150?u=techhub",
      role: "Community Organizer"
    },
    description: "The Global AI & Robotics Expo is back! Special month-long exhibition showcasing futuristic technologies.",
    attendees: 4500,
    tags: ["Tech", "Robotics", "AI"]
  },
  "m1": {
    id: "m1",
    title: "Startup Weekend Hackathon",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
    location: "Tech Hub Sandbox, 123 Innovation Way",
    date: "Thursday, Dec 10, 2026",
    endDate: "Saturday, Dec 12, 2026",
    time: "9:00 AM",
    endTime: "6:00 PM",
    price: "Free",
    host: {
      name: "Tech Hub Community",
      avatar: "https://i.pravatar.cc/150?u=techhub",
      role: "Community Organizer"
    },
    description: "Get ready for 48 hours of pure innovation! Startup Weekend is an exciting event where developers, designers, and entrepreneurs come together to share ideas, form teams, and build startups from scratch.",
    attendees: 124,
    tags: ["Tech", "Networking", "Entrepreneurship"]
  },
  "m2": {
    id: "m2",
    title: "UI/UX Masterclass",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
    location: "Creative Studios, Downtown",
    date: "Tuesday, Dec 15, 2026",
    time: "2:00 PM",
    endTime: "5:00 PM",
    price: "$150",
    host: {
      name: "Studio Design",
      avatar: "https://i.pravatar.cc/150?u=studio",
      role: "Design Agency"
    },
    description: "Master the art of user interface and user experience design in this intensive workshop. We'll cover everything from design principles and typography to prototyping and user testing.",
    attendees: 45,
    tags: ["Design", "Masterclass", "UX"]
  }
};

export default function EventDetailsPage({ params }: EventDetailsProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const event = eventsData[eventId] || eventsData["m1"]; // Fallback to m1 for demo

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

    const newStart = parseWebDateTime(event.date, event.time);
    const newEnd = parseWebDateTime(event.endDate || event.date, event.endTime || event.time);

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
              onClick={() => shareEvent({ id: event.id, title: event.title })}
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
                src={event.image} 
                alt={event.title} 
                fill 
                className="ed-hero-image"
                priority
              />
              <div className="ed-image-overlay" />
            </div>

            <div className="ed-info-body">
              <h1 className="ed-title">{event.title}</h1>
              
              <div className="ed-quick-host-info-row">
                <div className="ed-quick-host-info">
                  <Image 
                    src={event.host.avatar} 
                    alt={event.host.name} 
                    width={32} 
                    height={32} 
                    className="ed-mini-host-avatar"
                  />
                  <span className="ed-host-name-mini">{event.host.name}</span>
                </div>

                <div className="ed-attending-group-mini">
                   <span className="ed-attending-text-mini">{event.attendees}+ attending</span>
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
                {event.tags.map((tag: string) => (
                  <span key={tag} className="ed-pill-tag">{tag}</span>
                ))}
              </div>

              <div className="ed-section">
                <h2 className="ed-section-title">About the event</h2>
                <p className="ed-description">{event.description}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Key Details & Booking (Sidebar style) */}
          <div className="ed-side-column">
            <div className="ed-ticket-card glass-lux">
              <div className="ed-price-row-lux">
                <span className="ed-price-value-lux">{event.price}</span>
                {event.price.toLowerCase() === "free" && (
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
                      {event.endDate ? `${event.date} - ${event.endDate}` : event.date}
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
                      {event.endTime ? `${event.time} - ${event.endTime}` : event.time}
                    </span>
                  </div>
                </div>

                <div className="ed-detail-item">
                  <div className="ed-detail-icon-box">
                    <IoLocationSharp size={20} />
                  </div>
                  <div className="ed-detail-text">
                    <span className="ed-detail-title">Location</span>
                    <span className="ed-detail-value">{event.location}</span>
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
