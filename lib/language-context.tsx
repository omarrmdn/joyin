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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Load persisted language
    const savedLang = localStorage.getItem("app-language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "ar-EG")) {
      setLanguageState(savedLang);
    } else {
      // Try to detect from browser
      const browserLang = navigator.language;
      if (browserLang.startsWith("ar")) {
        setLanguageState("ar-EG");
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
    document.documentElement.lang = lang.split("-")[0];
    document.documentElement.dir = lang === "ar-EG" ? "rtl" : "ltr";
  };

  const dir = language === "ar-EG" ? "rtl" : "ltr";
  const t = useMemo(() => getTranslations(language), [language]);

  // Initial side effect for SSR/Hydration sync
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
