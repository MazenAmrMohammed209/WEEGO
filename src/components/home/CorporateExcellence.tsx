"use client";

import { Building2, BriefcaseBusiness, Globe, Award, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function CorporateExcellence() {
  const { t } = useLanguage();

  const corporateStats = [
    { icon: Building2, label: t("corporate.stats.partners.label"), value: t("corporate.stats.partners.value") },
    { icon: Globe, label: t("corporate.stats.countries.label"), value: t("corporate.stats.countries.value") },
    { icon: Award, label: t("corporate.stats.awards.label"), value: t("corporate.stats.awards.value") },
  ];
  return (
    <section className="py-24 bg-background border-b border-border">
      <div className="container-base">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="order-2 lg:order-1 relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-primary/5 border border-border">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/20 mix-blend-multiply" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <BriefcaseBusiness className="h-32 w-32 text-primary/40 dark:text-primary-foreground/40" />
               </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-10 -right-10 bg-background/80 backdrop-blur-xl border border-border p-6 rounded-3xl shadow-2xl max-w-[240px]">
               <div className="flex gap-4 items-start">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                     <Award className="h-6 w-6" />
                  </div>
                  <div>
                     <h4 className="font-bold text-lg text-foreground">{t("corporate.topRated")}</h4>
                     <p className="text-sm text-foreground/70">{t("corporate.topRatedDesc")}</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-3">
              {t("corporate.badge")}
            </h2>
            <h3 className="text-4xl font-extrabold tracking-tight text-primary dark:text-primary-foreground mb-6">
              {t("corporate.title")}
            </h3>
            <p className="text-lg text-foreground/70 mb-10 leading-relaxed">
              {t("corporate.description")}
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6">
               {corporateStats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col p-5 bg-bg-light dark:bg-bg-dark rounded-2xl border border-border/50">
                     <stat.icon className="h-8 w-8 text-accent mb-4" />
                     <span className="text-2xl font-bold text-foreground mb-1">{stat.value}</span>
                     <span className="text-sm font-medium text-foreground/60">{stat.label}</span>
                  </div>
               ))}
            </div>
            
            <div className="mt-10">
               <button className="text-accent font-semibold hover:text-accent/80 transition-colors inline-flex items-center gap-2 group">
                  {t("corporate.learn")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
