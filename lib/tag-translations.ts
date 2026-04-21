export const tagTranslations: Record<string, string> = {
  // Common categories
  "Adventure": "مغامرة",
  "Music": "موسيقى",
  "Food": "طعام",
  "Sports": "رياضة",
  "Art": "فن",
  "Education": "تعليم",
  "Health": "صحة",
  "Technology": "تكنولوجيا",
  "Business": "أعمال",
  "Party": "حفلة",
  "Gaming": "ألعاب",
  "Travel": "سفر",
  "Movies": "أفلام",
  "Charity": "خيري",
  "Networking": "تعارف",
  "Workshop": "ورشة عمل",
  "Fitness": "لياقة بدنية",
  "Yoga": "يوغا",
  "Nightlife": "سهر",
  "Comedy": "كوميديا",
  "Festival": "مهرجان",
  "Exhibition": "معرض",
  "Performance": "عرض",
  "Social": "اجتماعي",
  "Culture": "ثقافة",
  "Family": "عائلي",
  "Nature": "طبيعة",
  "Shopping": "تسوق",
  "Fashion": "موضة",
  "Photography": "تصوير",
  "Writing": "كتابة",
  "Reading": "قراءة",
  "Dating": "تعارف",
  "Coffee": "قهوة",
  "Spiritual": "روحاني",
  "History": "تاريخ",
  "Science": "علوم",
  "Environment": "بيئة",
  "Self-improvement": "تطوير الذات",
  "Relationship": "علاقات",
  "Dance": "رقص",
  "Cooking": "طبخ",
  "Crafts": "أعمال يدوية",
  "Design": "تصميم",
  "Pet": "حيوانات أليفة"
};

export function translateTag(tag: string, language: string): string {
  if (language === "ar-EG" && tagTranslations[tag]) {
    return tagTranslations[tag];
  }
  return tag;
}
