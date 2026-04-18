"use client";

import { Send, Mail, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function CTASection() {
  const { t } = useLanguage();
  return (
    <section className="py-24 md:py-32 bg-background overflow-hidden relative">
      {/* Background Decor Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] h-[600px] pointer-events-none opacity-40">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
      </div>

      <div className="container-base relative z-10 flex justify-center">
        <div 
           className="w-full max-w-[1050px] bg-bg-light/60 dark:bg-[#12161f]/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[2.5rem] p-10 sm:p-16 lg:p-20 text-center shadow-2xl relative overflow-hidden group hover:shadow-[0_20px_60px_-15px_rgba(182,255,10,0.05)] transition-all duration-700 animate-in slide-in-from-bottom-8 fade-in-0"
        >
          {/* Inner Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent dark:from-white/[0.02] opacity-50 rounded-[2.5rem] pointer-events-none" />
          
          {/* Subtle Accent Highlights */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="absolute -top-[150px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Label */}
            <span className="inline-flex items-center gap-2 text-accent font-black tracking-[0.2em] text-xs sm:text-sm uppercase mb-6 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {t("cta.badge")}
            </span>
            
            {/* Massive Heading */}
            <h2 className="text-[44px] sm:text-[50px] lg:text-[56px] leading-[1.1] font-black tracking-tight text-primary dark:text-primary-foreground mb-6 max-w-3xl">
              {t("cta.title1")} <br className="hidden sm:block" />
              <span className="text-foreground/80">{t("cta.title2")}</span>
            </h2>
            
            {/* Paragraph */}
            <p className="mx-auto max-w-2xl text-[18px] sm:text-[20px] leading-relaxed text-foreground/70 mb-12 font-medium">
              {t("cta.description1")} <span className="text-foreground dark:text-white font-bold">{t("cta.description2")}</span> {t("cta.description3")}
            </p>

            {/* Inline Form */}
            <form className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-2 p-2 bg-background/50 dark:bg-black/20 backdrop-blur-md border border-border/50 rounded-2xl sm:rounded-full shadow-inner mb-10 transition-all focus-within:border-accent/40 focus-within:bg-background/80" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1 flex items-center">
                 <div className="absolute start-6 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-foreground/40" />
                 </div>
                 <input 
                   type="email" 
                   required 
                   placeholder={t("cta.placeholder")}
                   className="w-full h-14 sm:h-16 ps-14 pe-6 bg-transparent text-foreground placeholder:text-foreground/40 rounded-full focus:outline-none text-base font-medium"
                 />
              </div>
              <button 
                type="submit"
                className="group h-14 sm:h-16 px-8 sm:px-10 bg-accent text-accent-foreground font-bold tracking-wide rounded-xl sm:rounded-full shadow-[0_0_20px_rgba(182,255,10,0.3)] hover:shadow-[0_0_30px_rgba(182,255,10,0.5)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                 {t("cta.subscribe")}
                 <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform rtl:-scale-x-100" />
              </button>
            </form>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm font-semibold text-foreground/50">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-accent/80" /> 
                <span>{t("cta.trust1")}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-border md:block hidden" />
              <div className="flex items-center gap-2.5">
                <span className="text-accent/80 font-bold shrink-0">✓</span> 
                <span>{t("cta.trust2")}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
