"use client";

import { Gift, Star, Award, Crown } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export function RewardsHighlight() {
  const { t } = useLanguage();
  return (
    <section className="py-24 bg-bg-light dark:bg-bg-dark pt-32">
      <div className="container-base">
        <div className="rounded-[3rem] bg-primary relative overflow-hidden shadow-2xl border border-primary-foreground/10">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
          <div 
             className="absolute -top-1/2 -right-1/2 h-[200%] w-[200%] bg-[conic-gradient(from_0deg,_transparent_0_340deg,_rgba(var(--accent),_0.15)_360deg)] pointer-events-none animate-[spin_10s_linear_infinite]"
          />
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-[100px] Mix-blend-screen pointer-events-none" />
          
          <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-24 lg:flex lg:items-center lg:justify-between lg:px-20 gap-16">
            
            <div 
               className="lg:max-w-xl animate-in slide-in-from-bottom-8 fade-in duration-700"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
                 <Crown className="h-4 w-4" /> {t("rewards.badge")}
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
                {t("rewards.title1")} <br /> {t("rewards.title2")} <span className="text-accent">{t("rewards.title3")}</span>
              </h2>
              <p className="text-lg leading-relaxed text-primary-foreground/80 mb-10 max-w-lg">
                {t("rewards.description")}
              </p>
              <Link
                href="/auth?variant=register"
                className="inline-flex items-center justify-center h-14 rounded-full bg-accent px-8 text-base font-semibold text-accent-foreground shadow-lg hover:shadow-accent/50 hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                {t("rewards.join")}
              </Link>
            </div>

            <div 
               className="mt-16 lg:mt-0 flex-shrink-0 relative w-full lg:w-auto flex flex-col sm:flex-row gap-6 justify-center animate-in zoom-in-95 fade-in duration-700 delay-200 fill-mode-both"
            >
              {/* Glass Cards */}
              <div className="flex flex-col gap-6">
                <div className="w-full sm:w-64 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 p-8 transform transition-transform hover:-translate-y-2 hover:bg-white/10 shadow-xl">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                     <Gift className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{t("rewards.b1.title")}</h4>
                  <p className="text-sm text-primary-foreground/60 leading-relaxed">{t("rewards.b1.desc")}</p>
                </div>
                
                <div className="w-full sm:w-64 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 p-8 transform transition-transform hover:-translate-y-2 hover:bg-white/10 shadow-xl sm:translate-x-8">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                     <Star className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{t("rewards.b2.title")}</h4>
                  <p className="text-sm text-primary-foreground/60 leading-relaxed">{t("rewards.b2.desc")}</p>
                </div>
              </div>

              <div className="flex flex-col gap-6 sm:translate-y-12">
                <div className="w-full sm:w-64 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 p-8 transform transition-transform hover:-translate-y-2 hover:bg-white/10 shadow-xl">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                     <Award className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{t("rewards.b3.title")}</h4>
                  <p className="text-sm text-primary-foreground/60 leading-relaxed">{t("rewards.b3.desc")}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
