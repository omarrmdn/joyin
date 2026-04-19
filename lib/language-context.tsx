"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { getTranslations, type TranslationKeys, type Language } from "./translations";
import { useRouter, usePathname } from "next/navigation";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "ltr" | "rtl";
  t: TranslationKeys;
  locale: string;
  localizeHref: (href: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ 
  children,
  initialLanguage = "en"
}: { 
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const router = useRouter();
  const pathname = usePathname();
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

    // Handle URL change to reflect the locale
    const segments = pathname.split("/");
    const firstSegment = segments[1];
    const isAr = firstSegment === "ar";
    const isEn = firstSegment === "en";

    let newPath = pathname;

    if (lang === "ar-EG") {
      if (!isAr) {
        if (isEn) {
          segments[1] = "ar";
          newPath = segments.join("/");
        } else {
          // If at root, it becomes /ar, if at /about, it becomes /ar/about
          newPath = "/ar" + (pathname === "/" ? "" : pathname);
        }
      }
    } else {
      // Switching to English
      if (isAr) {
        segments.splice(1, 1);
        newPath = segments.join("/") || "/";
      }
      // If it's already /en, we might want to strip it for "clean" URLs if that's the preference
      else if (isEn) {
        segments.splice(1, 1);
        newPath = segments.join("/") || "/";
      }
    }

    if (newPath !== pathname) {
      router.push(newPath);
    }
  };

  const dir = language === "ar-EG" ? "rtl" : "ltr";
  const t = useMemo(() => getTranslations(language), [language]);
  const locale = language === "ar-EG" ? "/ar" : "";

  const localizeHref = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
      return href;
    }
    // Remove existing locale prefix if any to avoid double prefixing
    let cleanHref = href;
    if (cleanHref.startsWith("/ar/") || cleanHref === "/ar") {
      cleanHref = cleanHref.replace(/^\/ar/, "");
    } else if (cleanHref.startsWith("/en/") || cleanHref === "/en") {
      cleanHref = cleanHref.replace(/^\/en/, "");
    }
    
    if (cleanHref === "" || cleanHref === "/") {
      return locale === "" ? "/" : locale;
    }
    
    return `${locale}${cleanHref.startsWith("/") ? "" : "/"}${cleanHref}`;
  };

  // Sync HTML attributes on every language change (including first client-side load)
  useEffect(() => {
    document.documentElement.lang = language.split("-")[0];
    document.documentElement.dir = language === "ar-EG" ? "rtl" : "ltr";
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t, locale, localizeHref }}>
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
