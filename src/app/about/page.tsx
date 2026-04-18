"use client";

import { Mail, Phone, MapPin, ShieldCheck, Car, Clock, Check, ChevronDown, MapPin as LocationIcon, Fuel } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const advantages = [
    {
      icon: ShieldCheck,
      title: t("advantages.safety.title"),
      description: t("advantages.safety.description"),
    },
    {
      icon: Car,
      title: t("advantages.fleet.title"),
      description: t("advantages.fleet.description"),
    },
    {
      icon: Clock,
      title: t("advantages.reliability.title"),
      description: t("advantages.reliability.description"),
    },
  ];

  const priceIncludes = [
    { icon: Car, label: t("priceIncludes.goReturn") },
    { icon: Clock, label: t("priceIncludes.waiting") },
    { icon: ShieldCheck, label: t("priceIncludes.driver") },
    { icon: Fuel, label: t("priceIncludes.fuel") },
    { icon: Check, label: t("priceIncludes.door") },
  ];

  const destinations = [
    t("destinations.cairo"), t("destinations.alexandria"), t("destinations.newAlamein"), t("destinations.northCoast"),
    t("destinations.siwa"), t("destinations.marsaAlam"), t("destinations.sharm"), t("destinations.dahab")
  ];

  const faqs = [
    { id: 1, question: t("faq.q1"), answer: t("faq.a1") },
    { id: 2, question: t("faq.q2"), answer: t("faq.a2") },
    { id: 3, question: t("faq.q3"), answer: t("faq.a3") },
    { id: 4, question: t("faq.q4"), answer: t("faq.a4") },
    { id: 5, question: t("faq.q5"), answer: t("faq.a5") },
    { id: 6, question: t("faq.q6"), answer: t("faq.a6") },
    { id: 7, question: t("faq.q7"), answer: t("faq.a7") },
    { id: 8, question: t("faq.q8"), answer: t("faq.a8") },
  ];

  return (
    <div className="bg-background min-h-screen pb-32">
      
      {/* 1. HERO SECTION */}
      <section id="about" className="pt-40 pb-16 text-center container-base">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-primary dark:text-primary-foreground mb-6">
          {t("about.title")}
        </h1>
        <p className="mx-auto max-w-3xl text-lg md:text-xl text-foreground/70 leading-relaxed">
          {t("about.description")}
        </p>
      </section>

      {/* 2. CONTACT INFO BAR */}
      <div id="contact" className="container-base mb-32 flex justify-center px-4">
        <div className="bg-bg-light dark:bg-[#111822] border border-border/50 rounded-2xl shadow-lg py-5 px-6 md:px-12 w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8 text-sm">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-accent" />
            </div>
            <div className="text-left rtl:text-right">
              <p className="text-foreground/50 text-xs uppercase font-bold tracking-wider mb-0.5">{t("contact.email")}</p>
              <a href="mailto:weego@gmail.com" className="font-semibold text-foreground hover:text-accent transition-colors">weego@gmail.com</a>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-border/40"></div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-accent" />
            </div>
            <div className="text-left rtl:text-right">
              <p className="text-foreground/50 text-xs uppercase font-bold tracking-wider mb-0.5">{t("contact.phone")}</p>
              <div className="flex gap-2 font-semibold text-foreground">
                <a href="tel:01505329501" className="hover:text-accent transition-colors">01505329501</a>
                <span className="text-border">|</span>
                <a href="tel:01505329405" className="hover:text-accent transition-colors">01505329405</a>
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-border/40"></div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-accent" />
            </div>
            <div className="text-left rtl:text-right">
              <p className="text-foreground/50 text-xs uppercase font-bold tracking-wider mb-0.5">{t("contact.office")}</p>
              <p className="font-semibold text-foreground leading-tight max-w-[200px]">Cairo — Hegaz Street — In front of Heliopolis Hospital</p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. CORE VALUES / FEATURES */}
      <section id="why-partner" className="container-base mb-32 max-w-6xl">
         <h2 className="text-3xl font-extrabold text-foreground mb-12 text-center">Why partner with WEEGO?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {advantages.map((adv, idx) => (
            <div 
              key={idx} 
              className="group bg-bg-light dark:bg-[#1C2530] border border-border/50 rounded-3xl p-10 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] h-full"
            >
              <div className="w-16 h-16 rounded-2xl border border-border/50 bg-background/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/10 group-hover:border-accent/30 transition-all duration-300">
                <adv.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{adv.title}</h3>
              <p className="text-foreground/70 leading-relaxed text-sm">{adv.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PRICE INCLUDES */}
      <div className="container-base mb-32">
        <div className="bg-bg-light dark:bg-[#0c1622] rounded-[2.5xl] border border-border/30 p-10 md:p-16 max-w-6xl mx-auto text-center shadow-lg relative overflow-hidden">
           {/* Subtle background glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-accent/5 blur-[100px] pointer-events-none rounded-full" />
           <div className="relative z-10">
              <h2 className="text-3xl font-extrabold text-foreground mb-12">{t("priceIncludes.title")}</h2>
              
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12">
                {priceIncludes.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center bg-white/5 dark:bg-[#1a2531] border border-border/50 rounded-2xl w-36 h-36 p-4 hover:-translate-y-1 hover:border-accent/30 hover:bg-white/10 dark:hover:bg-[#202b38] transition-all">
                    <item.icon className="w-8 h-8 text-accent mb-4" />
                    <span className="text-xs font-bold text-foreground text-center leading-tight mx-auto px-2">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-2">
                <span className="text-foreground/60 text-sm font-medium">{t("priceIncludes.starting")}</span>
                <span className="text-2xl font-black text-accent">2,000 EGP</span>
              </div>
           </div>
        </div>
      </div>

      {/* 5. SUPPORTED DESTINATIONS */}
      <div className="container-base mb-32 text-center max-w-5xl">
        <h2 className="text-3xl font-extrabold text-foreground mb-10">{t("destinations.title")}</h2>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {destinations.map((dest, idx) => (
            <div 
              key={idx}
              className="px-6 py-2.5 rounded-full bg-bg-light dark:bg-[#1C2530] border border-border/50 text-foreground text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-accent/30 transition-all cursor-default flex items-center gap-2"
            >
              <LocationIcon className="w-3.5 h-3.5 text-foreground/50" />
              {dest}
            </div>
          ))}
        </div>
      </div>

      {/* 6. FAQ SECTION */}
      <div className="container-base max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-foreground mb-10 text-center">{t("faq.title")}</h2>
        
        <div className="flex flex-col gap-3">
          {faqs.map((faq) => {
             const isOpen = openFaqId === faq.id;
             return (
               <div 
                key={faq.id} 
                className={cn(
                   "rounded-2xl border transition-all duration-300 overflow-hidden",
                   isOpen 
                   ? "bg-bg-light dark:bg-[#1C2530] border-border shadow-md" 
                   : "bg-background dark:bg-[#111822] border-border/50 hover:border-border"
                )}
               >
                 <button
                   onClick={() => toggleFaq(faq.id)}
                   className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                 >
                   <span className="font-bold text-foreground md:text-lg">{faq.question}</span>
                   <div className={cn(
                      "w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all duration-300",
                      isOpen ? "bg-background text-accent" : "text-foreground/50"
                   )}>
                     <ChevronDown className={cn(
                        "w-5 h-5 transition-transform duration-300", 
                        isOpen && "rotate-180"
                     )} />
                   </div>
                 </button>
                 
                 <div className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                 )}>
                   <div className="overflow-hidden">
                     <div className="px-6 pb-6 pt-0 text-foreground/70 text-sm md:text-base leading-relaxed border-t border-border/10">
                       {faq.answer}
                     </div>
                   </div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

    </div>
  );
}
