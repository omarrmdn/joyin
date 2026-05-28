"use client";

import { useState, useRef, useEffect, use } from "react";
import { TopBar } from "@/components/TopBar";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { 
  IoImageOutline, 
  IoLocationSharp, 
  IoCalendarSharp, 
  IoTimeOutline, 
  IoPricetagOutline, 
  IoSearchOutline, 
  IoCheckmark, 
  IoClose, 
  IoGlobeOutline, 
  IoLinkOutline, 
  IoPeopleOutline,
  IoCashOutline,
  IoInformationCircleOutline,
  IoPencilOutline,
  IoChevronBack
} from "react-icons/io5";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/compressImage";
import { useActions } from "@/hooks/use-actions";
import Link from "next/link";

type EventType = "onsite" | "online";
type Gender = "all" | "male" | "female";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t, language, localizeHref } = useLanguage();
  const { logAction } = useActions();

  // Component states
  const [isFetchingEvent, setIsFetchingEvent] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState<boolean | null>(null);

  const [tagSearch, setTagSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("onsite");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Location Autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<{latitude: number; longitude: number} | null>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`${localizeHref("/login")}?redirect=${encodeURIComponent(localizeHref(`/edit/${eventId}`))}`);
    }
  }, [user, authLoading, router, localizeHref, eventId]);

  // Fetch Event Data to Edit
  useEffect(() => {
    async function fetchEventDetails() {
      if (!user) return;
      setIsFetchingEvent(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            event_tags (
              tags (
                name
              )
            )
          `)
          .eq('id', eventId)
          .single();

        if (error) throw error;

        if (data) {
          // Check if current user is indeed the organizer
          if (data.organizer_id !== user.id) {
            setIsOrganizer(false);
            alert("You are not authorized to edit this event.");
            router.replace(localizeHref("/"));
            return;
          }
          setIsOrganizer(true);

          setTitle(data.title || "");
          setDescription(data.description || "");
          setEventType(data.is_online ? "online" : "onsite");
          setLocation(data.location || "");
          setLink(data.link || "");
          setStartDate(data.date || "");
          setStartTime(data.time ? data.time.slice(0, 5) : "");
          setEndDate(data.end_date || "");
          setEndTime(data.end_time ? data.end_time.slice(0, 5) : "");
          setCapacity(data.max_capacity ? String(data.max_capacity) : "");
          setPrice(data.price !== null && data.price !== undefined ? String(data.price) : "");
          setGender((data.gender as Gender) || "all");
          setImagePreview(data.image_url || null);
          
          if (data.latitude && data.longitude) {
            setSelectedLocationCoords({ latitude: data.latitude, longitude: data.longitude });
          }

          const tagsMapped = data.event_tags?.map((et: any) => et.tags?.name).filter(Boolean) || [];
          setSelectedTags(tagsMapped);
        }
      } catch (err) {
        console.error("Error fetching event for editing:", err);
        alert("Failed to load event details.");
        router.replace(localizeHref("/"));
      } finally {
        setIsFetchingEvent(false);
      }
    }

    if (user && eventId) {
      fetchEventDetails();
    }
  }, [user, eventId, router, localizeHref]);

  // Clear error when any relevant state changes
  useEffect(() => {
    if (formError) setFormError(null);
  }, [title, description, eventType, location, link, startDate, startTime, gender, image, selectedTags]);

  // Fetch tag options
  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase
        .from('tags')
        .select('name')
        .order('name', { ascending: true });
      
      if (data) {
        setTagOptions(data.map(t => t.name));
      } else if (error) {
        console.error("Error fetching tags:", error);
        setTagOptions([]);
      }
    }
    fetchTags();
  }, []);

  const filteredTags = tagOptions.filter(tag => 
    tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
    !selectedTags.includes(tag)
  );

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagSearch("");
    setShowTagDropdown(false);
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1200, 0.75);
        setImage(compressed);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(compressed);
      } catch {
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    
    try {
      // Basic validation
      if (!title || !description || !startDate || !startTime || (eventType === 'onsite' && !location) || (eventType === 'online' && !link) || !gender || (!image && !imagePreview) || selectedTags.length === 0) {
        setFormError(t.formValidationError);
        setIsPublishing(false);
        return;
      }
      setFormError(null);

      let imageUrl = imagePreview; // Default to existing image

      if (image) {
        const fileName = `${Math.random()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event_pic')
          .upload(fileName, image);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('event_pic')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // Update in Supabase
      const { error: eventError } = await supabase
        .from('events')
        .update({
          title,
          description,
          is_online: eventType === 'online',
          location: eventType === 'onsite' ? location : null,
          latitude: eventType === 'onsite' ? selectedLocationCoords?.latitude : null,
          longitude: eventType === 'onsite' ? selectedLocationCoords?.longitude : null,
          link: eventType === 'online' ? link : null,
          date: startDate,
          time: startTime,
          end_date: endDate || null,
          end_time: endTime || null,
          max_capacity: capacity ? parseInt(capacity) : null,
          price: price ? Math.abs(parseFloat(price)) : 0,
          gender: gender || 'all',
          image_url: imageUrl
        })
        .eq('id', eventId);

      if (eventError) throw eventError;

      // Update tags in join table
      // 1. Delete old event_tags
      await supabase
        .from('event_tags')
        .delete()
        .eq('event_id', eventId);

      // 2. Insert new ones
      if (selectedTags.length > 0) {
        const { data: tagsData } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', selectedTags);

        if (tagsData) {
          const eventTags = tagsData.map(t => ({
            event_id: eventId,
            tag_id: t.id
          }));
          await supabase.from('event_tags').insert(eventTags);
        }
      }

      // Log action
      await logAction({
        action_type: 'update_event',
        entity_type: 'event',
        entity_id: eventId,
        metadata: { title }
      });

      alert("Event updated successfully!");
      router.push(localizeHref(`/explore/${eventId}`));
    } catch (error: any) {
      console.error("Error updating event:", error);
      alert(`Failed to update event: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLocationSuggestions = async (query: string) => {
    if (!query.trim()) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    setIsLocationLoading(true);
    try {
      const url = `/api/location?q=${encodeURIComponent(query)}&lang=${language}`;
      const response = await fetch(url);
      const json = await response.json();

      if (json && Array.isArray(json)) {
        setLocationSuggestions(json.map((f: any) => ({
          id: f.place_id,
          description: f.display_name,
          longitude: parseFloat(f.lon),
          latitude: parseFloat(f.lat)
        })));
        setShowLocationSuggestions(true);
      }
    } catch (err) {
      console.error("Location autocomplete error:", err);
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocation(val);
    setSelectedLocationCoords(null);
    
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }
    
    locationTimeoutRef.current = setTimeout(() => {
      fetchLocationSuggestions(val);
    }, 400);
  };

  if (authLoading || isFetchingEvent || isOrganizer === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="loading-spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', width: '50px', height: '50px', borderRadius: '50%', borderLeftColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '20px', fontSize: '16px', fontWeight: '500' }}>{t.loading}...</p>
      </div>
    );
  }

  return (
    <>
      <div className="topbar-wrapper">
        <TopBar />
      </div>
      
      <div className="create-container">
        <form className="create-form" onSubmit={handleUpdate}>
          <div className="form-main-content">
            {/* Left Column: Media, Description & Metadata */}
            <div className="form-column column-left">
              <header className="create-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link href={localizeHref(`/explore/${eventId}`)} className="ed-back-btn" style={{ border: '1px solid var(--border)', background: 'var(--card-background)', padding: '8px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)' }}>
                  <IoChevronBack size={20} className="rtl-flip" />
                </Link>
                <h1>{t.editEvent}</h1>
              </header>
              <div className="form-group">
                <div 
                  className="image-upload-box"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <IoImageOutline size={48} className="upload-icon" />
                      <span>{t.uploadEventCover}</span>
                      <p className="upload-hint">{t.uploadHint}</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                />
              </div>

              <div className="form-group">
                <label className="section-label">{t.description}</label>
                <textarea 
                  placeholder={t.descriptionPlaceholder} 
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <p className="upload-hint" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <IoInformationCircleOutline size={14} /> {t.descriptionTip}
                </p>
              </div>
            </div>

            {/* Right Column: Details & Logistics */}
            <div className="form-column column-right">
              <div className="form-group">
                <label><IoPencilOutline size={18} /> {t.eventTitle}</label>
                <input 
                  type="text" 
                  placeholder={t.eventTitlePlaceholder} 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label><IoGlobeOutline size={18} /> {t.eventType}</label>
                <div className="type-selector">
                  <div 
                    className={`type-button ${eventType === 'onsite' ? 'active' : ''}`}
                    onClick={() => setEventType('onsite')}
                  >
                    <IoLocationSharp size={18} /> {t.onsite}
                  </div>
                  <div 
                    className={`type-button ${eventType === 'online' ? 'active' : ''}`}
                    onClick={() => setEventType('online')}
                  >
                    <IoGlobeOutline size={18} /> {t.online}
                  </div>
                </div>
              </div>

              {eventType === 'onsite' ? (
                <div className="form-group" ref={locationDropdownRef}>
                  <label><IoLocationSharp size={18} color="var(--accent)" /> {t.location}</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder={t.locationPlaceholder} 
                      value={location}
                      onChange={handleLocationChange}
                      onFocus={() => {
                        if (locationSuggestions.length > 0) setShowLocationSuggestions(true);
                      }}
                      required
                    />
                    {showLocationSuggestions && (locationSuggestions.length > 0 || isLocationLoading) && (
                      <div className="mobile-results-list" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--card-background)', border: '1px solid var(--border)', borderRadius: '12px', marginTop: '4px', maxHeight: '250px', overflowY: 'auto', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
                        <div style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--secondary-text)', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                          Search powered by OpenStreetMap
                        </div>
                        {isLocationLoading && (
                          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                            <div className="loading-spinner-small" style={{ marginBottom: '8px' }}></div>
                            {t.loading}...
                          </div>
                        )}
                        {!isLocationLoading && locationSuggestions.map(s => (
                          <div 
                            key={s.id} 
                            className="result-item"
                            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                            onClick={() => {
                              setLocation(s.description);
                              setSelectedLocationCoords({ latitude: s.latitude, longitude: s.longitude });
                              setShowLocationSuggestions(false);
                            }}
                          >
                            <IoLocationSharp size={16} color="var(--accent)" />
                            <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{s.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label><IoLinkOutline size={18} /> {t.meetingLink}</label>
                  <input 
                    type="url" 
                    placeholder={t.meetingLinkPlaceholder} 
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group half">
                  <label><IoCalendarSharp size={18} color="var(--accent)" /> {t.startDate}</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label><IoTimeOutline size={18}/> {t.startTime}</label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label><IoCalendarSharp size={18} /> {t.endDateOptional}</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="form-group half">
                  <label><IoTimeOutline size={18}/> {t.endTimeOptional}</label>
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label><IoPeopleOutline size={18} /> {t.capacity}</label>
                  <input 
                    type="number" 
                    placeholder={t.maxAttendees} 
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
                <div className="form-group half">
                  <label><IoCashOutline size={18} /> {t.priceEGP}</label>
                  <input 
                    type="number" 
                    placeholder={t.enterZeroForFree} 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" ref={dropdownRef}>
                <label><IoPricetagOutline size={18}/> {t.tags}</label>
                <div className="mobile-search-dropdown-container">
                  <div className="search-input-wrapper-lux">
                    <IoSearchOutline size={18} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder={t.searchTags} 
                      value={tagSearch}
                      onChange={(e) => {
                        setTagSearch(e.target.value);
                        setShowTagDropdown(true);
                      }}
                      onFocus={() => setShowTagDropdown(true)}
                    />
                  </div>

                  {showTagDropdown && tagSearch && (
                    <div className="mobile-results-list">
                      {filteredTags.length > 0 ? (
                        filteredTags.map(tag => (
                          <div 
                            key={tag} 
                            className={`result-item ${selectedTags.includes(tag) ? 'active' : ''}`}
                            onClick={() => toggleTag(tag)}
                          >
                            <div className="result-item-content">
                              <span>{tag}</span>
                            </div>
                            {selectedTags.includes(tag) && <IoCheckmark size={16} className="check-icon" />}
                          </div>
                        ))
                      ) : (
                        <div className="no-results">{t.noTagsFound} "{tagSearch}"</div>
                      )}
                    </div>
                  )}

                  <div className="selected-tags-container" style={{ minHeight: '40px' }}>
                    {selectedTags.map(tag => (
                      <div key={tag} className="selected-tag-pill">
                        <span>{tag}</span>
                        <button 
                          className="remove-tag-btn" 
                          type="button"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remove ${tag}`}
                        >
                          <IoClose size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-footer-content">
            <div className="form-group">
              <label className="section-label">{t.targetAudience}</label>
              <div className="gender-selector">
                <div 
                  className={`gender-option ${gender === 'all' ? 'active' : ''}`}
                  onClick={() => setGender('all')}
                >
                  {t.everyone}
                </div>
                <div 
                  className={`gender-option ${gender === 'male' ? 'active' : ''}`}
                  onClick={() => setGender('male')}
                >
                  {t.malesOnly}
                </div>
                <div 
                  className={`gender-option ${gender === 'female' ? 'active' : ''}`}
                  onClick={() => setGender('female')}
                >
                  {t.femalesOnly}
                </div>
              </div>
            </div>

            <div className="form-actions-desktop">
              {formError && (
                <div className="form-error-note">
                  <IoInformationCircleOutline size={20} />
                  {formError}
                </div>
              )}
              <button 
                className="publish-btn" 
                disabled={isPublishing}
                type="submit"
              >
                {isPublishing ? t.updating : t.updateEvent}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
