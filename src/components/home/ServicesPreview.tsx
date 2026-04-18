"use client";

import { Plane, Hotel, Map, CalendarCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export function ServicesPreview() {
  const { t } = useLanguage();

  const features = [
    {
      name: t("services.f1.name"),
      description: t("services.f1.desc"),
      icon: Plane,
      colSpan: "col-span-12 md:col-span-8",
    },
    {
      name: t("services.f2.name"),
      description: t("services.f2.desc"),
      icon: Hotel,
      colSpan: "col-span-12 md:col-span-4",
    },
    {
      name: t("services.f3.name"),
      description: t("services.f3.desc"),
      icon: Map,
      colSpan: "col-span-12 md:col-span-5",
    },
    {
      name: t("services.f4.name"),
      description: t("services.f4.desc"),
      icon: CalendarCheck,
      colSpan: "col-span-12 md:col-span-7",
    },
  ];

  return (
    <section className="py-24 bg-bg-light dark:bg-bg-dark">
      <div className="container-base">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-3">
              {t("services.title")}
            </h2>
            <h3 className="text-4xl font-extrabold tracking-tight text-primary dark:text-primary-foreground sm:text-5xl">
              {t("services.subtitle")}
            </h3>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent/80 transition-colors group"
          >
            {t("services.viewAll")}
            <ArrowRight className="h-5 w-5 rtl:rotate-180 rtl:group-hover:-translate-x-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {features.map((feature, idx) => (
            <div
              key={feature.name}
              className={`${feature.colSpan} group relative overflow-hidden flex flex-col justify-between p-8 rounded-[2rem] bg-background border border-border hover:border-accent/40 shadow-sm transition-all hover:shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-both`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
               {/* Ambient Glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
               
               <div className="mb-12 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-light dark:bg-bg-dark text-accent border border-border/50 group-hover:scale-110 transition-transform duration-300">
                 <feature.icon className="h-8 w-8" />
               </div>
               
               <div className="relative z-10">
                 <h4 className="text-2xl font-bold text-foreground mb-3">
                   {feature.name}
                 </h4>
                 <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                   {feature.description}
                 </p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
