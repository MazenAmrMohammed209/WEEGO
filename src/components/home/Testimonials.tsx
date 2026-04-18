"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

const STATIC_IDS = ['t1', 't2', 't3'];

export function Testimonials() {
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';

  const baseTestimonials = STATIC_IDS.map(id => ({
    name: t(`testimonials.${id}.name`) || "Happy Customer",
    role: t(`testimonials.${id}.role`) || "User",
    content: t(`testimonials.${id}.content`) || "Great service!",
  }));

  const N = baseTestimonials.length;
  // Clone array to create seamless infinite loop. 4 blocks.
  const testimonials = [...baseTestimonials, ...baseTestimonials, ...baseTestimonials, ...baseTestimonials];

  const [currentIndex, setCurrentIndex] = useState(N); // Start at the second block
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update/re-align slider on language switch to prevent disappearing UI
  useEffect(() => {
    if (!isClient) return;
    setIsTransitioning(false);
    setCurrentIndex(N);
  }, [lang, N, isClient]);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  useEffect(() => {
    // Seamless infinite looping logic boundary jumps
    if (currentIndex >= 2 * N) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex((prev) => prev - N);
      }, 700);
      return () => clearTimeout(timer);
    }
    
    if (currentIndex < N) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex((prev) => prev + N);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, N]);

  useEffect(() => {
    if (isHovered || !isClient) return;
    const interval = setInterval(() => {
      // Advance every 5 seconds
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, nextSlide, isClient]);

  const handleDotClick = (index: number) => {
    setIsTransitioning(true);
    const diff = index - (currentIndex % N);
    setCurrentIndex(prev => prev + diff);
  };
  
  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-base relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-3">
             {t("testimonials.badge")}
          </h2>
          <h3 className="text-4xl font-extrabold tracking-tight text-primary dark:text-primary-foreground sm:text-5xl">
            {t("testimonials.title")}
          </h3>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-5xl mx-auto" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          
          <div className="overflow-hidden px-4 md:px-16 pb-12 pt-6">
            <div 
              className={`flex ease-in-out ${isTransitioning ? "transition-transform duration-700" : "transition-none"}`}
              style={{ 
                transform: `translateX(${isRTL ? (currentIndex * 100) : -(currentIndex * 100)}%)` 
              }}
            >
              {testimonials.map((test, idx) => {
                const isActive = idx === currentIndex;
                
                return (
                  <div
                    key={idx}
                    className="w-full shrink-0 px-4"
                    style={{ flex: `0 0 100%` }}
                  >
                    <div
                      className={`max-w-4xl mx-auto bg-bg-light dark:bg-bg-dark border border-border p-10 md:p-16 rounded-[2.5rem] relative group transition-all duration-700 shadow-sm
                        ${isActive 
                          ? "opacity-100 scale-100 md:scale-[1.02] shadow-2xl border-accent/40" 
                          : "opacity-40 scale-95"}`
                      }
                    >
                       <Quote className="absolute top-10 end-10 md:top-16 md:end-16 h-16 w-16 opacity-30 text-foreground group-hover:text-accent/50 transition-colors duration-500 rtl:-scale-x-100 z-0" />
                       
                       <div className="flex flex-col h-full relative z-10 text-start">
                         {/* Header: User Info */}
                         <div className="flex items-center gap-5 mb-10">
                            <div className="h-14 w-14 shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xl text-primary dark:text-primary-foreground border-[2px] border-white/20 shadow-sm">
                               {test.name.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-foreground dark:text-white text-xl tracking-tight">{test.name}</p>
                               <p className="text-sm font-medium text-foreground/70 tracking-wide mt-1">{test.role}</p>
                            </div>
                         </div>
                         
                         {/* Stars */}
                         <div className="flex items-center gap-1.5 text-accent mb-8">
                           {[1, 2, 3, 4, 5].map((star) => (
                             <Star key={star} className="h-6 w-6 fill-current" />
                           ))}
                         </div>

                         {/* Testimonial Text */}
                         <p className="text-xl md:text-3xl font-medium text-foreground leading-[1.7] max-w-3xl">
                           "{test.content}"
                         </p>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={isRTL ? nextSlide : prevSlide}
            className="absolute top-1/2 -left-2 md:-left-8 -translate-y-1/2 w-14 h-14 rounded-full bg-background border border-border shadow-xl flex items-center justify-center text-foreground hover:text-accent hover:border-accent transition-all focus:outline-none z-20 group"
          >
            <ChevronLeft className="w-7 h-7 group-hover:-translate-x-0.5 transition-transform rtl:rotate-180" />
          </button>
          
          <button 
            onClick={isRTL ? prevSlide : nextSlide}
            className="absolute top-1/2 -right-2 md:-right-8 -translate-y-1/2 w-14 h-14 rounded-full bg-background border border-border shadow-xl flex items-center justify-center text-foreground hover:text-accent hover:border-accent transition-all focus:outline-none z-20 group"
          >
            <ChevronRight className="w-7 h-7 group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
          </button>
          
          {/* Pagination Dots */}
          <div className="flex justify-center items-center gap-2 mt-4">
            {Array.from({ length: N }).map((_, idx) => {
              const activeDot = currentIndex % N;
              return (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    activeDot === idx 
                      ? "w-10 h-2.5 bg-accent" 
                      : "w-2.5 h-2.5 bg-border hover:bg-foreground/30"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              )
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
