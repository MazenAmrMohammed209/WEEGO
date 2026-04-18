"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  const toggleLang = () => {
    // Capture scroll position before state change
    const scrollY = window.scrollY;
    
    const newLang = lang === "en" ? "ar" : "en";
    setLang(newLang);
    
    // Restore scroll immediately after state update to prevent jump to top
    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 0);
  };

  return (
    <button
      onClick={toggleLang}
      className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label="Toggle Language"
    >
      <Globe className="h-4 w-4" />
      <span className="uppercase">{lang}</span>
    </button>
  );
}
