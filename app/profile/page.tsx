"use client";

import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { TopBar } from "@/components/TopBar";
import { 
  IoSettingsOutline, 
  IoLogOutOutline, 
  IoChevronForward,
  IoAddCircleOutline,
  IoBugOutline,
  IoGlobeOutline,
  IoCashOutline,
  IoCameraOutline,
  IoCreateOutline,
  IoCheckmarkCircleOutline,
  IoCheckmarkCircle,
  IoCamera
} from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { IoSearchOutline, IoClose } from "react-icons/io5";

// Mock tags for interests
const INTERESTS = [
  "Music", "Nightlife", "Tech", "Food", "Art", 
  "Sports", "Business", "Fashion", "Health", "Gaming"
];

// Brand SVGs to avoid lucide-react missing icon errors
const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TwitterIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const TikTokIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [userInterests, setUserInterests] = useState(["Music", "Tech", "Food"]);

  const menuItems = [
    { icon: IoSettingsOutline, label: "Account Settings", id: "account" },
    { icon: IoBugOutline, label: "Report a Problem", id: "bug" },
  ];

  const [activeTab, setActiveTab] = useState("account");
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { language, setLanguage } = useLanguage();
  const [stats, setStats] = useState({ spent: 0, earned: 0 });
  
  // Bug Report State
  const [bugDescription, setBugDescription] = useState("");
  const [bugImages, setBugImages] = useState<string[]>([]);
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(user?.user_metadata?.full_name || "");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setTempName(user.user_metadata.full_name);
    }
  }, [user?.user_metadata?.full_name]);

  // Fetch user stats from Supabase
  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;
      
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase
        .from('users')
        .select('total_spend, total_revenue')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        setStats({
          spent: data.total_spend || 0,
          earned: data.total_revenue || 0
        });
      }
    }
    fetchStats();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      setIsUpdating(true);
      const { supabase } = await import("@/lib/supabase");
      
      const { error: dbError } = await supabase
        .from("users")
        .update({ name: tempName })
        .eq("id", user.id);
        
      if (dbError) throw dbError;
        
      await supabase.auth.updateUser({
        data: { full_name: tempName }
      });
      
      setIsEditingProfile(false);
      window.location.reload();
    } catch (error) {
       console.error("Error updating profile:", error);
       alert("Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }
    
    try {
      setIsUpdating(true);
      const { supabase } = await import("@/lib/supabase");
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = fileName;
      
      const { error: uploadError } = await supabase.storage
        .from('user_pfp')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from('user_pfp')
        .getPublicUrl(filePath);
        
      const publicUrl = publicUrlData.publicUrl;
      
      const { error: dbError } = await supabase
        .from("users")
        .update({ image_url: publicUrl })
        .eq("id", user.id);
        
      if (dbError) throw dbError;
      
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      window.location.reload();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUpdating(false);
    }
  };

  const languages = [
    { id: "en", name: "English" },
    { id: "ar-EG", name: "Egyptian Arabic" }
  ];

  const filteredInterests = useMemo(() => {
    if (!searchQuery) return [];
    return INTERESTS.filter(i => 
      i.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !userInterests.includes(i)
    );
  }, [searchQuery, userInterests]);

  const toggleInterest = (interest: string) => {
    if (userInterests.includes(interest)) {
      setUserInterests(userInterests.filter(i => i !== interest));
    } else {
      setUserInterests([...userInterests, interest]);
    }
  };



  return (
    <div className="profile-page-wrapper">
      <div className="topbar-wrapper">
        <TopBar />
      </div>
      
      <div className="profile-container">
        <header className="profile-header">
          <div className="profile-header-main">
            <div className="avatar-wrapper-lux">
              {user?.user_metadata?.avatar_url ? (
                <Image 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  width={120} 
                  height={120} 
                  className="profile-avatar-lux"
                />
              ) : (
                <div className="avatar-fallback-lux">
                  {(user?.email?.[0] || 'U').toUpperCase()}
                </div>
              )}
              <div className="avatar-glow" />
              {isEditingProfile && (
                <label className="edit-badge-lux">
                   <IoCamera size={20} />
                   <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={isUpdating} />
                </label>
              )}
            </div>
            
            <div className="profile-info-lux">
              <div className="profile-name-edit-row">
                {isEditingProfile ? (
                  <input 
                    className="name-input-lux"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Your Name"
                    autoFocus
                  />
                ) : (
                  <h1 className="profile-name-lux">
                    {user?.user_metadata?.full_name || 'Event Enthusiast'}
                  </h1>
                )}
                
                <button 
                  className="profile-edit-btn-inline" 
                  onClick={isEditingProfile ? handleSaveProfile : () => setIsEditingProfile(true)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                     <span className="loading-dots">...</span>
                  ) : isEditingProfile ? (
                     <IoCheckmarkCircle size={28} />
                  ) : (
                     <IoCreateOutline size={28} />
                  )}
                </button>
              </div>
              <p className="profile-email-lux">{user?.email || 'Sign in to access your profile'}</p>
            </div>
          </div>
          
          <div className="profile-stats-lux">
            <div className="stat-lux">
              <span className="stat-label-lux">Spent</span>
              <span className="stat-value-lux">EGP {stats.spent}</span>
            </div>
            <div className="stat-divider-lux" />
            <div className="stat-lux">
              <span className="stat-label-lux">Earned</span>
              <span className="stat-value-lux">EGP {stats.earned}</span>
            </div>
          </div>
        </header>

        <div className="profile-tabs-nav">

          {menuItems.map(item => (
            <button 
              key={item.id}
              className={`tab-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>


          <div className="tab-content-area">
            <div className="tab-content-header">
              <h2 className="tab-content-title">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
            </div>
            
            {activeTab === 'account' ? (
              <div className="settings-scroll-content" style={{ padding: '20px 0' }}>
                {/* Interests Section (from Overview) */}
                <div className="section-group">
                  <div className="section-header-lux" style={{ borderBottom: 'none', padding: 0, marginBottom: '16px' }}>
                    <h2 className="section-title">Your Interests</h2>
                    <button 
                      className="edit-interests-btn"
                      onClick={() => setIsEditingInterests(!isEditingInterests)}
                    >
                      {isEditingInterests ? "Done" : "Edit"}
                    </button>
                  </div>

                  {isEditingInterests && (
                    <div className="interests-search-container">
                      <div className="interests-search-bar">
                        <IoSearchOutline size={16} className="search-icon-mini" />
                        <input 
                          type="text" 
                          placeholder="Search and add interests..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="interests-input"
                        />
                      </div>
                      
                      {searchQuery && filteredInterests.length > 0 && (
                        <div className="suggested-interests-dropdown">
                          {filteredInterests.map(interest => (
                            <button 
                              key={interest}
                              className="suggestion-item"
                              onClick={() => {
                                toggleInterest(interest);
                                setSearchQuery("");
                              }}
                            >
                              <IoAddCircleOutline size={14} className="plus-icon" />
                              {interest}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="interests-tags-lux">
                    {userInterests.map((interest) => (
                      <div 
                        key={interest} 
                        className="interest-tag-pill"
                      >
                        {interest}
                        {isEditingInterests && (
                          <button 
                            onClick={() => toggleInterest(interest)}
                            className="remove-tag-btn"
                          >
                            <IoClose size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {userInterests.length === 0 && !isEditingInterests && (
                      <p className="empty-interests-text">No interests added yet.</p>
                    )}
                  </div>
                </div>

                <div className="divider-line" />

                <div className="section-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <IoGlobeOutline size={20} className="text-primary" />
                    <h2 className="section-title" style={{ marginBottom: 0 }}>Language</h2>
                  </div>
                  <div className="currency-options">
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        className={`currency-box ${language === lang.id ? "active" : ""}`}
                        onClick={() => setLanguage(lang.id as "en" | "ar-EG")}
                      >
                        <span className="box-text" style={{ color: language === lang.id ? 'white' : 'var(--secondary-text)' }}>
                          {lang.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="note-text">
                    Some screens may need to be reopened for language changes to fully apply.
                  </p>
                </div>

                <div className="divider-line" />

                <div className="section-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <IoCashOutline size={20} className="text-primary" />
                    <h2 className="section-title" style={{ marginBottom: 0 }}>Currency</h2>
                  </div>
                  <div className="currency-options">
                    <div className="currency-box active">
                      <span className="box-text">EGP</span>
                    </div>
                  </div>
                </div>

                {user?.id && (
                  <>
                    <div className="divider-line" />
                    <div className="section-group">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <IoLogOutOutline size={20} className="text-error" style={{ color: 'var(--error)' }} />
                        <h2 className="section-title" style={{ marginBottom: 0 }}>Account Security</h2>
                      </div>
                      <button className="signout-btn" onClick={() => signOut()}>
                        <IoLogOutOutline size={22} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : activeTab === 'bug' ? (
              <div className="bug-report-web-container">
                <div className="bug-report-grid">
                  <div className="bug-form-main">
                    <div className="input-group-lux">
                      <label className="input-label-lux">Issue Description</label>
                      <textarea 
                        className="bug-textarea-lux"
                        placeholder="Please provide as much detail as possible about the issue..."
                        value={bugDescription}
                        onChange={(e) => setBugDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bug-form-sidebar">
                    <div className="input-group-lux">
                      <label className="input-label-lux">Screenshots (Up to 3)</label>
                      <div className="bug-images-grid-lux">
                        {bugImages.map((img, idx) => (
                          <div key={idx} className="bug-image-preview-lux">
                            <img src={img} alt="bug preview" />
                            <button 
                              className="remove-image-pill"
                              onClick={() => setBugImages(bugImages.filter((_, i) => i !== idx))}
                            >
                              <IoClose size={14} />
                            </button>
                          </div>
                        ))}
                        
                        {bugImages.length < 3 && (
                          <label className="bug-upload-zone-lux">
                            <IoCameraOutline size={24} />
                            <span>Add Image</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              multiple 
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                const newImages = files.map(f => URL.createObjectURL(f));
                                setBugImages([...bugImages, ...newImages].slice(0, 3));
                              }} 
                              style={{ display: 'none' }} 
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="bug-submit-container-lux">
                      <button 
                        className={`bug-submit-btn-lux ${isSubmittingBug || !bugDescription.trim() ? 'disabled' : ''}`}
                        disabled={isSubmittingBug || !bugDescription.trim()}
                        onClick={async () => {
                          setIsSubmittingBug(true);
                          await new Promise(r => setTimeout(r, 1500));
                          alert("Report submitted. Thank you!");
                          setBugDescription("");
                          setBugImages([]);
                          setIsSubmittingBug(false);
                        }}
                      >
                        {isSubmittingBug ? "Submitting..." : "Send Report"}
                      </button>
                      <p className="bug-help-text">Our team usually responds within 24 hours.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="tab-placeholder-content">
                <div className="placeholder-card-lux">
                  <p>This is the {menuItems.find(m => m.id === activeTab)?.label} section.</p>
                  <p className="sub-text">Content for this tab is coming soon.</p>
                </div>
              </div>
            )}
          </div>
        
        <section className="follow-us-section">
          <div className="follow-header-lux">
            <div className="follow-line" />
            <span className="follow-title">Follow Us</span>
            <div className="follow-line" />
          </div>
          <div className="social-links-lux">
            <a href="https://instagram.com/eventaat" target="_blank" rel="noopener noreferrer" className="social-icon-box-lux">
              <InstagramIcon size={24} />
            </a>
            <a href="https://tiktok.com/@eventaat" target="_blank" rel="noopener noreferrer" className="social-icon-box-lux">
              <TikTokIcon size={24} />
            </a>
            <a href="https://x.com/eventaat" target="_blank" rel="noopener noreferrer" className="social-icon-box-lux">
              <TwitterIcon size={24} />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
