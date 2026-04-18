"use client";

import { ArrowRight, Globe2, Star, Car } from "lucide-react";
import Link from "next/link";
import heroImg from "@/app/assets/heroimg.jpg";

import { useLanguage } from "@/context/LanguageContext";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-24 pb-32">
      <div  className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-in fade-in duration-1000"
        style={{ backgroundImage: `url(${heroImg.src})` }}>
        <div className="absolute inset-0 bg-black/50"></div>
        </div>
       
      

      <div className="container-base relative z-10 w-full animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150 fill-mode-both">
        <div className="max-w-4xl">
          <div className="mb-6 flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 border border-accent/30 px-4 py-1.5 text-sm font-medium text-accent backdrop-blur-md">
              <Globe2 className="h-4 w-4" />
              The New Standard of Travel
            </span>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl leading-[1.1] drop-shadow-xl" dangerouslySetInnerHTML={{ __html: t("hero.title").replace("WEEGO", '<span class="text-accent underline decoration-accent/30 underline-offset-8">WEEGO</span>') }}>
          </h1>
          
          <p className="mt-8 text-xl leading-relaxed text-white/90 max-w-2xl drop-shadow-md">
            {t("hero.subtitle")}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/booking">
              <button
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-accent px-8 text-base font-semibold text-accent-foreground shadow-[0_0_20px_rgba(182,255,10,0.3)] hover:shadow-[0_0_30px_rgba(182,255,10,0.5)] hover:bg-accent/90 hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t("hero.bookNow")}
                <ArrowRight className="h-5 w-5 rtl:rotate-180" />
              </button>
            </Link>
            <Link href="/services">
              <button
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-transparent border-2 border-white/80 px-8 text-base font-semibold text-white shadow-sm hover:bg-white/10 hover:border-white hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {t("hero.viewFleet")}
                <Car className="h-5 w-5 rtl:scale-x-[-1]" />
              </button>
            </Link>
          </div>
          
          {/* Social Proof */}
          <div className="mt-12 flex items-center gap-4 text-sm font-medium text-white/80">
            <div className="flex flex-col">
              <div className="flex items-center text-accent">
                <Star className="h-4 w-4 fill-current drop-shadow-sm" />
                <Star className="h-4 w-4 fill-current drop-shadow-sm" />
                <Star className="h-4 w-4 fill-current drop-shadow-sm" />
                <Star className="h-4 w-4 fill-current drop-shadow-sm" />
                <Star className="h-4 w-4 fill-current drop-shadow-sm" />
              </div>
              <span className="drop-shadow-md mt-1">Trusted by 2M+ travelers</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
