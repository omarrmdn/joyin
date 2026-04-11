"use client";

import { useState, useRef, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { useLanguage } from "@/lib/language-context";
import { 
  IoImageOutline, 
  IoLocationSharp, 
  IoCalendarSharp, 
  IoTimeOutline, 
  IoPricetagOutline, 
  IoSearchOutline, 
  IoChevronDown, 
  IoCheckmark, 
  IoClose, 
  IoGlobeOutline, 
  IoLinkOutline, 
  IoPeopleOutline,
  IoCashOutline,
  IoInformationCircleOutline
} from "react-icons/io5";
import { supabase } from "@/lib/supabase";

type EventType = "onsite" | "online";
type Gender = "all" | "male" | "female";

export default function CreateEventPage() {
  const { t } = useLanguage();
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
  const [gender, setGender] = useState<Gender | "">("")  ;
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Clear error when any relevant state changes
  useEffect(() => {
    if (formError) setFormError(null);
  }, [title, description, eventType, location, link, startDate, startTime, gender, image, selectedTags]);

  // Fetch tags from backend (Supabase)
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
        setTagOptions([
          "Music & Concerts", "Technology & AI", "Art & Culture", 
          "Food & Drinks", "Sports & Fitness", "Social Gathering"
        ]);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    
    try {
      // Basic validation
      if (!title || !description || !startDate || !startTime || (eventType === 'onsite' && !location) || (eventType === 'online' && !link) || !gender || !image || selectedTags.length === 0) {
        setFormError(t.formValidationError);
        setIsPublishing(false);
        return;
      }
      setFormError(null);

      let imageUrl = "";
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event_pic')
          .upload(fileName, image);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('event_pic')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // Insert into Supabase
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          title,
          description,
          is_online: eventType === 'online',
          location: eventType === 'onsite' ? location : null,
          meeting_link: eventType === 'online' ? link : null,
          date: startDate,
          time: startTime,
          end_date: endDate || null,
          end_time: endTime || null,
          capacity: capacity ? parseInt(capacity) : null,
          price: price ? parseFloat(price) : 0,
          gender,
          image_url: imageUrl,
          tags: selectedTags, // Duplicate tags here for easy retrieval
          organizer_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Also insert into event_tags join table for relational integrity
      if (eventData && selectedTags.length > 0) {
        // First get tag IDs
        const { data: tagsData } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', selectedTags);

        if (tagsData) {
          const eventTags = tagsData.map(t => ({
            event_id: eventData.id,
            tag_id: t.id
          }));
          await supabase.from('event_tags').insert(eventTags);
        }
      }

      alert(t.eventPublished);
      window.location.href = "/"; // Redirect to home
    } catch (error: any) {
      console.error("Error publishing event:", error);
      alert(`Failed to publish event: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="topbar-wrapper">
        <TopBar />
      </div>
      
      <div className="create-container">
        <form className="create-form" onSubmit={handlePublish}>
          <div className="form-main-content">
            {/* Left Column: Media, Description & Metadata */}
            <div className="form-column column-left">
              <header className="create-header">
                <h1>{t.createEvent}</h1>
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
                <label><IoPricetagOutline size={18} /> {t.eventTitle}</label>
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
                <div className="form-group">
                  <label><IoLocationSharp size={18} color="var(--accent)" /> {t.location}</label>
                  <input 
                    type="text" 
                    placeholder={t.locationPlaceholder} 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
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
                {isPublishing ? t.publishing : t.publishEvent}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
