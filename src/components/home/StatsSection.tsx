"use client";

import { Star } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export function StatsSection() {
  const { t } = useLanguage();

  const stats = [
    { value: t("stats.s1.value"), label: t("stats.s1.label") },
    { value: t("stats.s2.value"), label: t("stats.s2.label") },
    { value: t("stats.s3.value"), hasStar: true, label: t("stats.s3.label") },
    { value: t("stats.s4.value"), label: t("stats.s4.label") },
  ];
  return (
    <section className="bg-primary pt-20 pb-20 relative z-20 shadow-2xl">
      <div className="container-base">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 divide-none md:divide-x divide-white/10">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center px-4 animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="text-5xl md:text-6xl font-black text-accent mb-4 flex items-center justify-center tracking-tighter drop-shadow-[0_0_15px_rgba(182,255,10,0.3)]">
                {stat.value}
                {stat.hasStar && (
                  <Star className="inline-block h-10 w-10 ms-1 -translate-y-1 fill-accent text-accent drop-shadow-[0_0_15px_rgba(182,255,10,0.5)]" />
                )}
              </div>
              <div className="text-xs md:text-sm font-bold tracking-[0.25em] text-white/50 uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
