"use client";

import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from "react";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

type Language = "en" | "ar";

const translations: Record<Language, any> = {
  en,
  ar,
};

// Use useLayoutEffect safely on the client to avoid flicker, fallback to useEffect on server
const useSafeLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // 1. Read from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("weego_lang") as Language;
    if (saved === "ar" || saved === "en") {
      setLangState(saved);
    }
    setMounted(true);
  }, []);

  // 2. Apply to HTML globally
  useSafeLayoutEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    
    if (lang === "ar") {
      document.documentElement.classList.add("lang-ar");
    } else {
      document.documentElement.classList.remove("lang-ar");
    }
  }, [lang, mounted]);

  // 3. Setter that saves to localStorage
  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("weego_lang", newLang);
    }
  };

  // Helper function to get translation string deeply by key (e.g., "navbar.home")
  const t = (key: string): string => {
    const keys = key.split(".");
    let value = translations[lang];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback or missing key message
        return key;
      }
    }
    
    return value as string;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {!mounted ? <div style={{ visibility: "hidden" }}>{children}</div> : children}
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
