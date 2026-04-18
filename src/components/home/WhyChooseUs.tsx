"use client";

import { ShieldCheck, Zap, Headphones, HeartHandshake } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export function WhyChooseUs() {
  const { t } = useLanguage();

  const reasons = [
    {
      title: t("why.r1.title"),
      description: t("why.r1.desc"),
      icon: ShieldCheck,
    },
    {
      title: t("why.r2.title"),
      description: t("why.r2.desc"),
      icon: Zap,
    },
    {
      title: t("why.r3.title"),
      description: t("why.r3.desc"),
      icon: Headphones,
    },
    {
      title: t("why.r4.title"),
      description: t("why.r4.desc"),
      icon: HeartHandshake,
    },
  ];
  return (
    <section id="why-partner" className="py-[120px] bg-background relative overflow-hidden">
      {/* Subtle Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[1000px] h-[1000px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-base relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 lg:gap-[120px] h-full items-center lg:items-center">
          
          {/* LEFT: Typography Block (50%) */}
          <div className="lg:w-1/2 flex flex-col justify-center max-w-full lg:max-w-[620px] animate-in slide-in-from-left-8 fade-in duration-1000">
            <h2 className="text-[64px] sm:text-[80px] lg:text-[90px] xl:text-[110px] leading-[1.05] font-black tracking-tight text-primary dark:text-primary-foreground mb-8 whitespace-nowrap">
              {t("why.title1")} <br />
              {t("why.title2")}<span className="text-accent drop-shadow-sm">{t("why.title3")}</span>
            </h2>
            <div className="flex flex-col">
              <p className="text-[26px] sm:text-[30px] lg:text-[34px] font-extrabold tracking-tight text-foreground/50 leading-tight mb-7">
                {t("why.subtitle")}
              </p>
              <p className="text-[18px] sm:text-[20px] lg:text-[22px] text-foreground/70 leading-relaxed font-medium max-w-lg animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300 fill-mode-both">
                {t("why.description")}
              </p>
            </div>
          </div>

          {/* RIGHT: Feature Cards (50%) */}
          <div className="lg:w-1/2 w-full grid sm:grid-cols-2 gap-8 lg:gap-10 lg:mt-6">
            {reasons.map((reason, idx) => (
              <div 
                key={reason.title} 
                className="group relative flex flex-col p-8 bg-bg-light dark:bg-bg-dark border border-border/80 hover:border-accent/50 rounded-3xl hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(182,255,10,0.08)] transition-all duration-500 hover:-translate-y-2 h-full animate-in slide-in-from-bottom-8 fade-in fill-mode-both"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {/* Accent glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex h-14 w-14 mb-6 items-center justify-center rounded-2xl bg-background shadow-sm border border-border group-hover:scale-110 group-hover:bg-accent/10 transition-transform duration-500">
                    <reason.icon className="h-7 w-7 text-accent stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <h4 className="text-[22px] font-bold text-foreground mb-3 tracking-tight group-hover:text-accent transition-colors duration-300">
                      {reason.title}
                    </h4>
                    <p className="text-[16px] text-foreground/60 leading-relaxed font-medium">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
