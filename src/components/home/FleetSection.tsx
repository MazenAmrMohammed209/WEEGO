"use client";

import Image from "next/image";
import { Car, Shield, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import WeegoImage from "@/app/assets/WEEGO.jpeg";

export function FleetSection() {
  const { t } = useLanguage();

  const fleetFeatures = [
    { icon: Car, title: t("fleetSection.f1.title"), text: t("fleetSection.f1.text") },
    { icon: Shield, title: t("fleetSection.f2.title"), text: t("fleetSection.f2.text") },
    { icon: Clock, title: t("fleetSection.f3.title"), text: t("fleetSection.f3.text") },
  ];
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container-base grid lg:grid-cols-2 gap-16 items-center">
        
        <div 
           className="animate-in slide-in-from-left-8 fade-in duration-700"
        >
          <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-3">
            {t("fleetSection.badge")}
          </h2>
          <h3 className="text-4xl font-extrabold tracking-tight text-primary dark:text-primary-foreground sm:text-5xl mb-6">
            {t("fleetSection.title1")} <br /> {t("fleetSection.title2")}
          </h3>
          <p className="text-lg text-foreground/70 mb-10 leading-relaxed max-w-lg">
            {t("fleetSection.description")}
          </p>
          
          <div className="space-y-6">
             {fleetFeatures.map((feat, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                   <div className="p-3 bg-bg-light dark:bg-bg-dark border border-border rounded-xl text-foreground mt-1">
                      <feat.icon className="h-5 w-5" />
                   </div>
                   <div>
                      <h4 className="font-bold text-lg text-foreground">{feat.title}</h4>
                      <p className="text-foreground/70">{feat.text}</p>
                   </div>
                </div>
             ))}
          </div>
        </div>

        <div 
           className="relative aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-[600px] w-full bg-bg-light dark:bg-bg-dark rounded-[2.5rem] border border-border p-8 overflow-hidden flex flex-col items-center justify-center group animate-in slide-in-from-right-8 fade-in duration-700"
        >
           {/* Abstract representational graphic instead of image to keep it clean */}
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-10" />
           
           <Image src={WeegoImage} alt="Weego Premium Fleet" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
           <div className="absolute bottom-10 left-10 right-10 p-6 bg-background/80 backdrop-blur-xl border border-border rounded-2xl z-20">
              <div className="flex justify-between items-center mb-2">
                 <span className="font-bold text-foreground">{t("fleetSection.sedan")}</span>
                 <span className="text-accent text-sm font-semibold">{t("fleetSection.ready")}</span>
              </div>
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                 <div className="w-full h-full bg-accent" />
              </div>
           </div>
        </div>

      </div>
    </section>
  );
}
