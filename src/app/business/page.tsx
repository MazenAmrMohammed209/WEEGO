"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Clock, FileText, Briefcase, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function BusinessPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    businessEmail: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("corporate_accounts")
        .insert([{
          company_name: formData.companyName,
          contact_person: formData.contactPerson,
          contact_email: formData.businessEmail,
          email: formData.businessEmail,
          message: formData.message,
          status: 'pending'
        }])
        .select()
        .single();
        
      if (error) {
        toast.error(error.message);
        console.error("Supabase error:", error);
        return;
      }
      
      toast.success("Your request has been submitted successfully. Our team will contact you shortly.");
      setFormData({ companyName: "", contactPerson: "", businessEmail: "", message: "" });
    } catch (err: any) {
      console.error("Error submitting business form:", err);
      toast.error(err.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      
      {/* SECTION 1 — HERO (Corporate Excellence) */}
      <div className="relative pt-40 pb-32 md:pb-48 flex items-center min-h-[60vh]">
        {/* Background Image Setup (using placeholder div with dark luxury feel) */}
        <div className="absolute inset-0 z-0 bg-[#0a1017]">
            {/* We use a gradient over a dark slate to simulate the dark office environment */ }
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1017] via-[#0a1017]/90 to-transparent z-10"></div>
            {/* If an actual image is provided later, it goes here */}
            <div className="absolute top-0 right-0 w-[70%] h-full opacity-30 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
        </div>

        <div className="container-base relative z-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-accent/10 border border-accent/20 text-accent mb-6 uppercase tracking-wider backdrop-blur-sm">
              {t("business.hero.badge")}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              {t("business.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              {t("business.hero.description")}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2 — TRUSTED BY INDUSTRY LEADERS */}
      <div className="bg-bg-light dark:bg-[#0c121a] border-b border-border py-12">
        <div className="container-base">
          <p className="text-center text-xs font-bold text-foreground/50 uppercase tracking-[0.2em] mb-8">
            {t("business.trusted")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
             {/* Placeholder text logos with slight hover highlight */}
            <span className="text-xl md:text-2xl font-serif font-bold text-foreground hover:opacity-100 transition-opacity cursor-default">HOTEL LUX</span>
            <span className="text-lg md:text-xl font-sans font-black tracking-tighter text-foreground hover:opacity-100 transition-opacity cursor-default">CorpTravel</span>
            <span className="text-lg md:text-xl font-mono font-bold text-foreground hover:opacity-100 transition-opacity cursor-default">Globex</span>
            <span className="text-xl md:text-2xl font-serif italic text-foreground hover:opacity-100 transition-opacity cursor-default">EliteSystems</span>
            <span className="text-lg md:text-xl font-sans font-extrabold uppercase tracking-widest text-foreground hover:opacity-100 transition-opacity cursor-default">VANTAGE</span>
          </div>
        </div>
      </div>

      {/* SECTION 3 — WHY PARTNER WITH US */}
      <div className="py-24 md:py-32 container-base">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start max-w-7xl mx-auto">
          
          {/* Left Side: Benefits */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary dark:text-primary-foreground mb-12 uppercase">
              {t("business.benefits.title")}
            </h2>
            
            <div className="space-y-10">
              {/* Benefit 1 */}
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-bg-light dark:bg-[#1a2531] border border-border/50 flex flex-shrink-0 items-center justify-center">
                  <Clock className="w-5 h-5 text-foreground/80" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{t("business.benefits.b1.title")}</h3>
                  <p className="text-foreground/70 leading-relaxed text-sm md:text-base">
                    {t("business.benefits.b1.description")}
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-bg-light dark:bg-[#1a2531] border border-border/50 flex flex-shrink-0 items-center justify-center">
                  <FileText className="w-5 h-5 text-foreground/80" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{t("business.benefits.b2.title")}</h3>
                  <p className="text-foreground/70 leading-relaxed text-sm md:text-base">
                    {t("business.benefits.b2.description")}
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-bg-light dark:bg-[#1a2531] border border-border/50 flex flex-shrink-0 items-center justify-center">
                  <Briefcase className="w-5 h-5 text-foreground/80" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{t("business.benefits.b3.title")}</h3>
                  <p className="text-foreground/70 leading-relaxed text-sm md:text-base">
                    {t("business.benefits.b3.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Partnership Inquiry Form */}
          <div className="bg-bg-light dark:bg-[#111822] rounded-[2rem] p-8 md:p-10 border border-border shadow-[0_8px_30px_rgba(0,0,0,0.1)] relative overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            
            <h3 className="text-2xl font-bold text-foreground mb-8 relative z-10">{t("business.form.title")}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                  {t("business.form.labels.companyName")}
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder={t("business.form.placeholders.companyName")}
                  className="w-full bg-background dark:bg-[#0c121a] border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contactPerson" className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                  {t("business.form.labels.contactPerson")}
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder={t("business.form.placeholders.contactPerson")}
                  className="w-full bg-background dark:bg-[#0c121a] border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="businessEmail" className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                  {t("business.form.labels.businessEmail")}
                </label>
                <input
                  type="email"
                  id="businessEmail"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  placeholder={t("business.form.placeholders.businessEmail")}
                  className="w-full bg-background dark:bg-[#0c121a] border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                  {t("business.form.labels.message")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t("business.form.placeholders.message")}
                  rows={4}
                  className="w-full bg-background dark:bg-[#0c121a] border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#0c1622] hover:bg-[#1a2531] dark:bg-[#0a1017] dark:hover:bg-[#111822] text-white border border-border/50 font-bold text-sm tracking-wider uppercase py-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? "Submitting..." : t("business.form.submit")}
              </button>

            </form>
          </div>

        </div>
      </div>

    </div>
  );
}
