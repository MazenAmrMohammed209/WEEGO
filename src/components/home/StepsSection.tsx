"use client";

import { MapPin, CreditCard, Car } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export function StepsSection() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: MapPin,
      num: "01",
      title: t("steps.s1"),
      delay: 0,
    },
    {
      icon: CreditCard,
      num: "02",
      title: t("steps.s2"),
      delay: 0.2,
    },
    {
      icon: Car,
      num: "03",
      title: t("steps.s3"),
      delay: 0.4,
    },
  ];
  return (
    <section className="flex flex-col w-full">
      {/* Steps Section */}
      <div className="bg-bg-light dark:bg-bg-dark pt-32 pb-40 relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-base relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-28">
            <h3 className="text-accent font-extrabold tracking-[0.3em] text-sm uppercase mb-6 flex items-center justify-center gap-4">
              <span className="h-px w-8 bg-accent/50"></span>
              {t("steps.badge")}
              <span className="h-px w-8 bg-accent/50"></span>
            </h3>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground dark:text-white mb-8">
              {t("steps.title")}
            </h2>
            <p className="text-xl text-foreground/70 dark:text-white/60 font-medium">
              {t("steps.description")}
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connecting Line - desktop only */}
            <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-[2px] bg-border dark:bg-white/5" />
            
            <div className="grid md:grid-cols-3 gap-16 md:gap-8 relative">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col items-center text-center group animate-in slide-in-from-bottom-12 fade-in duration-1000 fill-mode-both"
                  style={{ animationDelay: `${step.delay}s` }}
                >
                  {/* Icon Circle */}
                  <div className="relative mb-8">
                    <div className="h-24 w-24 rounded-full bg-accent text-primary flex items-center justify-center shadow-[0_0_40px_rgba(182,255,10,0.15)] group-hover:shadow-[0_0_50px_rgba(182,255,10,0.4)] group-hover:bg-accent/90 group-hover:scale-110 transition-all duration-500 relative z-10">
                      <step.icon className="h-10 w-10 stroke-[2.5]" />
                    </div>
                  </div>
                  
                  {/* Step Number */}
                  <div className="text-accent text-sm font-black tracking-[0.2em] mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                    {step.num}
                  </div>
                  
                  {/* Step Title */}
                  <h4 className="text-2xl font-bold text-foreground dark:text-white tracking-wide">{step.title}</h4>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mt-24 flex justify-center animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500 fill-mode-both">
            <Link 
              href="/booking" 
              className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-foreground dark:text-white transition-all duration-300 bg-primary/10 dark:bg-primary/40 border border-border dark:border-white/10 rounded-full hover:bg-primary hover:text-primary-foreground hover:border-accent/50 hover:shadow-[0_0_30px_rgba(182,255,10,0.15)] overflow-hidden"
            >
              {/* Button background effect */}
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-10 dark:opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              
              {/* Hover sweep effect */}
              <span className="absolute top-0 left-0 w-full h-full -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-foreground/10 dark:via-white/10 to-transparent"></span>
              
              <span className="relative text-lg tracking-[0.15em] uppercase text-foreground dark:text-white group-hover:text-primary-foreground dark:group-hover:text-accent transition-colors duration-300">
                {t("steps.cta")}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
