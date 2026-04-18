"use client";

import { Plane, Clock4, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import AirportImg from "@/app/assets/Airport Pickup.webp";

export function AirportTransfers() {
  const { t } = useLanguage();
  
  const features = [
    { icon: Plane, text: t("airportTransfers.features.tracking") },
    { icon: Clock4, text: t("airportTransfers.features.wait") },
    { icon: ShieldCheck, text: t("airportTransfers.features.drivers") },
  ];

  return (
    <section className="py-24 bg-bg-light dark:bg-bg-dark border-y border-border overflow-hidden">
      <div className="container-base grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Text Information */}
        <div className="order-2 lg:order-1 animate-in slide-in-from-left-8 fade-in duration-700">
          <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-3">
            {t("airportTransfers.home.badge")}
          </h2>
          <h3 className="text-4xl font-extrabold tracking-tight text-primary dark:text-primary-foreground sm:text-5xl mb-6 leading-tight">
            {t("airportTransfers.home.title")}
          </h3>
          <p className="text-lg text-foreground/70 mb-10 leading-relaxed max-w-lg">
            {t("airportTransfers.home.description")}
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="h-12 w-12 bg-background border border-border flex items-center justify-center shrink-0 rounded-xl shadow-sm text-accent">
                  <feat.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-foreground">
                  {feat.text}
                </span>
              </div>
            ))}
          </div>

          <Link href="/booking?type=airport" className="inline-block">
            <button className="px-8 py-4 bg-accent text-accent-foreground rounded-full font-bold hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(182,255,10,0.2)] hover:shadow-[0_0_30px_rgba(182,255,10,0.4)] hover:-translate-y-1 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent">
              {t("airportTransfers.home.cta")}
            </button>
          </Link>
        </div>

        {/* Right Side: Premium Visual */}
        <div className="order-1 lg:order-2 relative aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-[650px] w-full rounded-[2.5rem] overflow-hidden group shadow-2xl animate-in slide-in-from-right-8 fade-in duration-700">
          {/* Abstract dark gradient image acting as our premium scene placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/30 z-10" />
          <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-1000" style={{ backgroundImage: `url("${AirportImg.src}")` }} />
          
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20" />

          {/* Floating Glass Card Over Image */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-auto sm:w-[85%] bg-background/80 dark:bg-background/60 backdrop-blur-xl border border-white/20 dark:border-border/50 rounded-2xl p-6 shadow-2xl z-30 transform group-hover:-translate-y-2 transition-transform duration-700">
            <div className="flex items-start gap-5">
              <div className="h-14 w-14 bg-accent/20 rounded-full flex items-center justify-center text-accent shrink-0 ring-1 ring-accent/30">
                <Plane className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-lg font-bold text-foreground dark:text-white">
                    Flight Tracked
                  </p>
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">LIVE</span>
                </div>
                <p className="text-sm text-foreground/80 dark:text-white/80 font-medium">
                  We automatically adjust for delays.
                </p>
              </div>
            </div>
            
            {/* Animated tracking bar */}
            <div className="mt-6 w-full h-2 bg-foreground/10 dark:bg-white/10 rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 bottom-0 w-2/3 bg-accent rounded-full animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(182,255,10,0.5)]" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
