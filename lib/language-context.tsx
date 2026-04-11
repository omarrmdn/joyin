"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { getTranslations, type TranslationKeys, type Language } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "ltr" | "rtl";
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ 
  children,
  initialLanguage = "en"
}: { 
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  // Use a state that starts with the server-passed language
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    // Only fetch from localStorage if we are in the browser
    const savedLang = localStorage.getItem("app-language") as Language;
    
    // If the saved language is valid and differs from our current state (which came from server cookies)
    // we update it. This should only happen if cookies are blocked but localStorage works.
    if (savedLang && (savedLang === "en" || savedLang === "ar-EG") && savedLang !== language) {
      setLanguageState(savedLang);
      // Also sync the cookie back so the next refresh is correct on the server
      document.cookie = `app-language=${savedLang}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
    
    // Crucial: Set cookie with path=/ to ensure it's sent on every request to every page
    document.cookie = `app-language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Update HTML attributes immediately for UI responsiveness
    document.documentElement.lang = lang.split("-")[0];
    document.documentElement.dir = lang === "ar-EG" ? "rtl" : "ltr";
  };

  const dir = language === "ar-EG" ? "rtl" : "ltr";
  const t = useMemo(() => getTranslations(language), [language]);

  // Sync HTML attributes on every language change (including first client-side load)
  useEffect(() => {
    document.documentElement.lang = language.split("-")[0];
    document.documentElement.dir = language === "ar-EG" ? "rtl" : "ltr";
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
