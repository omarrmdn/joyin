// Centralized translations for English and Arabic (Egyptian)
// Usage: import { useTranslation } from "@/lib/translations";

type TranslationKeys = {
  // Navigation
  home: string;
  myEvents: string;
  create: string;
  messages: string;
  profile: string;
  you: string;
  notifications: string;
  signIn: string;
  signOut: string;

  // Home / Feed
  all: string;
  nearMe: string;
  loadingEvents: string;
  noEventsYet: string;
  noEventsForTag: string;
  searchPlaceholder: string;
  free: string;
  attending: string;

  // Event Details
  back: string;
  aboutTheEvent: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  join: string;
  joining: string;
  joined: string;
  secureSpot: string;
  reportEvent: string;
  share: string;
  freeEventNotice: string;
  reportIt: string;
  toRemoveEvent: string;
  overlapConflict: string;

  // Report Modal
  reportProblem: string;
  reportSubtitle: string;
  whatIsTheIssue: string;
  reportPlaceholder: string;
  screenshotsOptional: string;
  sendReport: string;
  submitting: string;
  reportSubmitted: string;
  reportThankYou: string;
  maxImagesAllowed: string;

  // Create Event
  createEvent: string;
  uploadEventCover: string;
  uploadHint: string;
  description: string;
  descriptionPlaceholder: string;
  descriptionTip: string;
  eventTitle: string;
  eventTitlePlaceholder: string;
  eventType: string;
  onsite: string;
  online: string;
  locationPlaceholder: string;
  meetingLink: string;
  meetingLinkPlaceholder: string;
  startDate: string;
  startTime: string;
  endDateOptional: string;
  endTimeOptional: string;
  capacity: string;
  maxAttendees: string;
  priceEGP: string;
  enterZeroForFree: string;
  tags: string;
  searchTags: string;
  noTagsFound: string;
  targetAudience: string;
  everyone: string;
  malesOnly: string;
  femalesOnly: string;
  publishEvent: string;
  publishing: string;
  formValidationError: string;
  eventPublished: string;

  // My Events
  noEventsForDay: string;
  today: string;
  canceled: string;
  cancel: string;

  // Profile
  spent: string;
  earned: string;
  accountSettings: string;
  reportAProblem: string;
  yourInterests: string;
  edit: string;
  done: string;
  searchInterests: string;
  noInterestsYet: string;
  language: string;
  currency: string;
  accountSecurity: string;
  languageNote: string;
  eventEnthusiast: string;
  signInToAccess: string;
  yourName: string;
  followUs: string;
  activityLog: string;
  recentActivity: string;
  noActivity: string;

  // Bug Report
  issueDescription: string;
  bugPlaceholder: string;
  screenshots: string;
  addImage: string;
  teamResponse: string;

  // Messages
  yourMessages: string;
  selectConversation: string;
  searchConversations: string;
  noMessagesFound: string;
  yesterday: string;

  // Notifications
  noNotifications: string;
  markAllAsRead: string;
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  daysAgo: string;

  // Login
  welcomeBack: string;
  signInSubtitle: string;
  continueWithGoogle: string;
  termsAgreement: string;
  termsOfService: string;

  // Share Modal
  shareTitle: string;

  // Misc
  loading: string;
  myAccount: string;
  comingSoon: string;
  errorDetectingLocation: string;
  geoNotSupported: string;
  failedUpdateProfile: string;
  fileTooLarge: string;
  failedUploadImage: string;
  
  // Footer
  privacy: string;
  terms: string;
  support: string;
  builtWith: string;
  egp: string;
};

const en: TranslationKeys = {
  // Navigation
  home: "Home",
  myEvents: "My events",
  create: "Create",
  messages: "Messages",
  profile: "Profile",
  you: "You",
  notifications: "Notifications",
  signIn: "Sign In",
  signOut: "Sign Out",

  // Home / Feed
  all: "All",
  nearMe: "Near me",
  loadingEvents: "Loading events...",
  noEventsYet: "No events available yet.",
  noEventsForTag: "No events found for",
  searchPlaceholder: "Search events, locations, or tags...",
  free: "Free",
  attending: "attending",

  // Event Details
  back: "Back",
  aboutTheEvent: "About the event",
  date: "Date",
  time: "Time",
  location: "Location",
  organizer: "Organizer",
  join: "Join",
  joining: "Joining...",
  joined: "Joined",
  secureSpot: "Secure your spot before it's full!",
  reportEvent: "Report Event",
  share: "Share",
  freeEventNotice: "This event is free. If the organizer asks for money, please",
  reportIt: "report it",
  toRemoveEvent: "to remove the event.",
  overlapConflict: "Overlap Conflict: You are already attending",

  // Report Modal
  reportProblem: "Report a Problem",
  reportSubtitle: "Help us understand what's wrong with this event.",
  whatIsTheIssue: "What is the issue?",
  reportPlaceholder: "Describe the problem in detail (e.g. fake event, inappropriate content, etc.)",
  screenshotsOptional: "Screenshots (Optional, up to 3)",
  sendReport: "Send Report",
  submitting: "Submitting...",
  reportSubmitted: "Report Submitted",
  reportThankYou: "Thank you. Our team will review this event shortly.",
  maxImagesAllowed: "Maximum 3 images allowed",

  // Create Event 
  createEvent: "Create Event",
  uploadEventCover: "Upload Event Cover",
  uploadHint: "16:9 ratio recommended (Max 5MB)",
  description: "Description",
  descriptionPlaceholder: "Tell your attendees what to expect... Describe the vibe, the program, and any special requirements.",
  descriptionTip: "Tip: Be detailed to attract more attendees.",
  eventTitle: "Event Title",
  eventTitlePlaceholder: "e.g., Summer Music Festival",
  eventType: "Event Type",
  onsite: "Onsite",
  online: "Online",
  locationPlaceholder: "Search for a venue or address",
  meetingLink: "Meeting Link",
  meetingLinkPlaceholder: "https://zoom.us/j/...",
  startDate: "Start Date",
  startTime: "Start Time",
  endDateOptional: "End Date (Optional)",
  endTimeOptional: "End Time (Optional)",
  capacity: "Capacity",
  maxAttendees: "Max attendees",
  priceEGP: "Price (EGP)",
  enterZeroForFree: "Enter 0 for free",
  tags: "Tags",
  searchTags: "Search and select tags...",
  noTagsFound: "No tags found for",
  targetAudience: "Target Audience",
  everyone: "Everyone",
  malesOnly: "Males Only",
  femalesOnly: "Females Only",
  publishEvent: "Publish Event",
  publishing: "Publishing...",
  formValidationError: "Please fill in all fields (Title, Image, Description, Date/Time, Location, Gender, and Tags) to publish your event.",
  eventPublished: "Event published successfully!",

  // My Events
  noEventsForDay: "No events found for this day.",
  today: "Today",
  canceled: "Canceled",
  cancel: "Cancel",

  // Profile
  spent: "Spent",
  earned: "Earned",
  accountSettings: "Account Settings",
  reportAProblem: "Report a Problem",
  yourInterests: "Your Interests",
  edit: "Edit",
  done: "Done",
  searchInterests: "Search and add interests...",
  noInterestsYet: "No interests added yet.",
  language: "Language",
  currency: "Currency",
  accountSecurity: "Account Security",
  languageNote: "Some screens may need to be reopened for language changes to fully apply.",
  eventEnthusiast: "Event Enthusiast",
  signInToAccess: "Sign in to access your profile",
  yourName: "Your Name",
  followUs: "Follow Us",
  activityLog: "Activity Log",
  recentActivity: "Recent Activity",
  noActivity: "No activity recorded yet.",

  // Bug Report
  issueDescription: "Issue Description",
  bugPlaceholder: "Please provide as much detail as possible about the issue...",
  screenshots: "Screenshots (Up to 3)",
  addImage: "Add Image",
  teamResponse: "Our team usually responds within 24 hours.",

  // Messages
  yourMessages: "Your Messages",
  selectConversation: "Select a conversation from the sidebar to view your chat or start messaging.",
  searchConversations: "Search conversations...",
  noMessagesFound: "No messages found",
  yesterday: "Yesterday",

  // Notifications
  noNotifications: "No notifications",
  markAllAsRead: "Mark all as read",
  justNow: "Just now",
  minutesAgo: "m ago",
  hoursAgo: "h ago",
  daysAgo: "d ago",

  // Login
  welcomeBack: "Welcome back",
  signInSubtitle: "Sign in to your Joyin account to continue",
  continueWithGoogle: "Continue with Google",
  termsAgreement: "By continuing, you agree to our",
  termsOfService: "Terms of Service",

  // Share Modal
  shareTitle: "Share",

  // Misc
  loading: "Loading...",
  myAccount: "My Account",
  comingSoon: "Content for this tab is coming soon.",
  errorDetectingLocation: "Error detecting location: ",
  geoNotSupported: "Geolocation is not supported by this browser.",
  failedUpdateProfile: "Failed to update profile.",
  fileTooLarge: "File is too large. Maximum size is 5MB.",
  failedUploadImage: "Failed to upload image.",
  privacy: "Privacy",
  terms: "Terms",
  support: "Support",
  builtWith: "Built with",
  egp: "EGP",
};

const arEG: TranslationKeys = {
  // Navigation
  home: "الرئيسية",
  myEvents: "فعالياتي",
  create: "إنشاء",
  messages: "الرسائل",
  profile: "الملف الشخصي",
  you: "أنت",
  notifications: "الإشعارات",
  signIn: "تسجيل الدخول",
  signOut: "تسجيل الخروج",

  // Home / Feed
  all: "الكل",
  nearMe: "قريب مني",
  loadingEvents: "جاري تحميل الفعاليات...",
  noEventsYet: "لا توجد فعاليات متاحة حتى الآن.",
  noEventsForTag: "لا توجد فعاليات لـ",
  searchPlaceholder: "ابحث عن فعاليات، أماكن، أو وسوم...",
  free: "مجاني",
  attending: "مشارك",

  // Event Details
  back: "رجوع",
  aboutTheEvent: "عن الفعالية",
  date: "التاريخ",
  time: "الوقت",
  location: "الموقع",
  organizer: "المنظم",
  join: "انضم",
  joining: "جاري الانضمام...",
  joined: "تم الانضمام",
  secureSpot: "احجز مكانك قبل ما يكتمل العدد!",
  reportEvent: "الإبلاغ عن الفعالية",
  share: "مشاركة",
  freeEventNotice: "الفعالية دي مجانية. لو المنظم طلب فلوس، من فضلك",
  reportIt: "بلّغ عنها",
  toRemoveEvent: "عشان نشيل الفعالية.",
  overlapConflict: "تعارض في المواعيد: أنت بالفعل مشترك في",

  // Report Modal
  reportProblem: "الإبلاغ عن مشكلة",
  reportSubtitle: "ساعدنا نفهم إيه المشكلة في الفعالية دي.",
  whatIsTheIssue: "إيه المشكلة؟",
  reportPlaceholder: "اوصف المشكلة بالتفصيل (مثلاً: فعالية وهمية، محتوى غير مناسب، إلخ.)",
  screenshotsOptional: "صور (اختياري، حتى ٣ صور)",
  sendReport: "إرسال البلاغ",
  submitting: "جاري الإرسال...",
  reportSubmitted: "تم إرسال البلاغ",
  reportThankYou: "شكراً ليك. فريقنا هيراجع الفعالية دي قريباً.",
  maxImagesAllowed: "الحد الأقصى ٣ صور",

  // Create Event
  createEvent: "إنشاء فعالية",
  uploadEventCover: "ارفع صورة غلاف الفعالية",
  uploadHint: "نسبة ١٦:٩ مُوصى بها (الحد الأقصى ٥ ميجابايت)",
  description: "الوصف",
  descriptionPlaceholder: "قول للحاضرين يتوقعوا إيه... اوصف الجو، البرنامج، وأي متطلبات خاصة.",
  descriptionTip: "نصيحة: كن مفصَّل عشان تجذب ناس أكتر.",
  eventTitle: "عنوان الفعالية",
  eventTitlePlaceholder: "مثال: مهرجان الموسيقى الصيفي",
  eventType: "نوع الفعالية",
  onsite: "حضوري",
  online: "أونلاين",
  locationPlaceholder: "ابحث عن مكان أو عنوان",
  meetingLink: "رابط الاجتماع",
  meetingLinkPlaceholder: "https://zoom.us/j/...",
  startDate: "تاريخ البدء",
  startTime: "وقت البدء",
  endDateOptional: "تاريخ الانتهاء (اختياري)",
  endTimeOptional: "وقت الانتهاء (اختياري)",
  capacity: "السعة",
  maxAttendees: "الحد الأقصى للحاضرين",
  priceEGP: "السعر (ج.م)",
  enterZeroForFree: "اكتب ٠ للمجاني",
  tags: "الوسوم",
  searchTags: "ابحث واختار وسوم...",
  noTagsFound: "مفيش وسوم لـ",
  targetAudience: "الفئة المستهدفة",
  everyone: "الجميع",
  malesOnly: "ذكور فقط",
  femalesOnly: "إناث فقط",
  publishEvent: "نشر الفعالية",
  publishing: "جاري النشر...",
  formValidationError: "من فضلك املا كل الحقول (العنوان، الصورة، الوصف، التاريخ/الوقت، الموقع، النوع، والوسوم) عشان تنشر الفعالية.",
  eventPublished: "تم نشر الفعالية بنجاح!",

  // My Events
  noEventsForDay: "مفيش فعاليات لليوم ده.",
  today: "اليوم",
  canceled: "ملغية",
  cancel: "إلغاء",

  // Profile
  spent: "المصروف",
  earned: "الأرباح",
  accountSettings: "إعدادات الحساب",
  reportAProblem: "الإبلاغ عن مشكلة",
  yourInterests: "اهتماماتك",
  edit: "تعديل",
  done: "تم",
  searchInterests: "ابحث وأضف اهتمامات...",
  noInterestsYet: "لم تتم إضافة اهتمامات بعد.",
  language: "اللغة",
  currency: "العملة",
  accountSecurity: "أمان الحساب",
  languageNote: "بعض الشاشات ممكن تحتاج تتفتح تاني عشان تغيير اللغة يطبق بالكامل.",
  eventEnthusiast: "محب الفعاليات",
  signInToAccess: "سجل دخولك عشان توصل لملفك الشخصي",
  yourName: "اسمك",
  followUs: "تابعنا",
  activityLog: "سجل النشاط",
  recentActivity: "النشاط الأخير",
  noActivity: "مفيش نشاط مسجل حتى الآن.",

  // Bug Report
  issueDescription: "وصف المشكلة",
  bugPlaceholder: "من فضلك اشرح المشكلة بأكبر قدر ممكن من التفاصيل...",
  screenshots: "صور (حتى ٣ صور)",
  addImage: "أضف صورة",
  teamResponse: "فريقنا بيرد عادةً خلال ٢٤ ساعة.",

  // Messages
  yourMessages: "رسائلك",
  selectConversation: "اختار محادثة من القائمة عشان تشوف الشات أو ابدأ محادثة جديدة.",
  searchConversations: "ابحث في المحادثات...",
  noMessagesFound: "مفيش رسائل",
  yesterday: "أمس",

  // Notifications
  noNotifications: "مفيش إشعارات",
  markAllAsRead: "تعيين الكل كمقروء",
  justNow: "الآن",
  minutesAgo: "د",
  hoursAgo: "س",
  daysAgo: "ي",

  // Login
  welcomeBack: "أهلاً بيك",
  signInSubtitle: "سجل دخولك لحساب Joyin عشان تكمل",
  continueWithGoogle: "المتابعة باستخدام جوجل",
  termsAgreement: "بالمتابعة، أنت موافق على",
  termsOfService: "شروط الخدمة",

  // Share Modal
  shareTitle: "مشاركة",

  // Misc
  loading: "جاري التحميل...",
  myAccount: "حسابي",
  comingSoon: "محتوى القسم ده قريباً.",
  errorDetectingLocation: "خطأ في تحديد الموقع: ",
  geoNotSupported: "المتصفح ده مش بيدعم تحديد الموقع.",
  failedUpdateProfile: "فشل تحديث الملف الشخصي.",
  fileTooLarge: "الملف كبير أوي. الحد الأقصى ٥ ميجابايت.",
  failedUploadImage: "فشل رفع الصورة.",
  privacy: "الخصوصية",
  terms: "الشروط",
  support: "الدعم",
  builtWith: "صُنع بـ",
  egp: "ج.م",
};

const translations = {
  en,
  "ar-EG": arEG,
};

export type Language = "en" | "ar-EG";

export function getTranslations(language: Language): TranslationKeys {
  return translations[language] || translations.en;
}

export type { TranslationKeys };
