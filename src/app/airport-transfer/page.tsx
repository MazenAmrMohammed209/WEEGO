"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, ShieldCheck, Clock4, Plane } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createBooking, createAirportRequest } from "@/lib/supabaseActions";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import AirportImg from "@/app/assets/Airport Pickup.webp";

export default function AirportTransferPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", airport: "", flightNumber: "",
    date: "", time: "", pax: "1", luggage: "1", pickup: "", dropoff: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const customerId = sessionData?.session?.user?.id || null;

      const refNum = "WGO-APT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const dateTimeString = `${formData.date}T${formData.time}:00`;
      const scheduledDateTime = new Date(dateTimeString).toISOString();

      // Get a default category for airport transfer (e.g., Sedan)
      const { data: catData } = await supabase.from('vehicle_categories').select('id').eq('name', 'Sedan').single();
      const defaultCategoryId = catData?.id || undefined;

      // 1. Insert into bookings (primary check)
      const { data: bookingId, error: bookingError } = await createBooking(
        formData.pickup || formData.airport,
        formData.dropoff,
        scheduledDateTime,
        refNum,
        formData.name,
        formData.phone,
        "eg",
        Number(formData.pax),
        Number(formData.luggage),
        customerId || undefined,
        "airport_pickup",
        formData.flightNumber,
        scheduledDateTime,
        defaultCategoryId
      );

      console.log("BOOKING INSERT:", bookingId, bookingError);

      if (bookingError || !bookingId) {
        throw bookingError || new Error("Failed to create primary booking");
      }

      let ticketUrl: string | null = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${bookingId}_${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tickets')
          .upload(fileName, file);
          
        if (uploadError) {
          console.error("File upload failed:", uploadError.message);
        } else if (uploadData) {
            const { data: publicUrlData } = supabase.storage.from('tickets').getPublicUrl(uploadData.path);
            ticketUrl = publicUrlData.publicUrl;
        }
      }

      console.log("STEP 1: Booking success", bookingId);
      console.log("STEP 2: Calling airport insert");

      // FORCED EXECUTION
      const airportPayload = {
        booking_id: bookingId,
        flight_number: formData.flightNumber || "UNKNOWN_FLIGHT",
        arrival_time: scheduledDateTime || new Date().toISOString(),
        passenger_count: Number(formData.pax) || 1,
        luggage_count: Number(formData.luggage) || 0,
        ticket_file_url: ticketUrl,
        customer_id: customerId || null,
        status: "pending",
        price: 0
      };

      console.log("STEP 3: Payload:", airportPayload);

      const { success, data, error: reqError } = await createAirportRequest(
        airportPayload.booking_id,
        airportPayload.flight_number,
        airportPayload.arrival_time,
        airportPayload.passenger_count,
        airportPayload.luggage_count,
        airportPayload.ticket_file_url,
        airportPayload.customer_id,
        airportPayload.status,
        airportPayload.price
      );

      console.log("STEP 4: Supabase response:", data, reqError);

      if (!success) {
        console.error("FORCE INSERT FAILED:", reqError);
      }

      // Fast UI Success Non-blocking response
      setIsSubmitting(false);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      console.error("Form submission error:", err);
      toast.error("Failed to submit request.");
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <main className="min-h-screen pt-[120px] md:pt-[140px] bg-bg-light dark:bg-bg-dark flex justify-center p-4 md:p-8">
      
      {/* Container max width 1200px */}
      <div className="w-full max-w-[1200px] grid lg:grid-cols-[45%_55%] gap-8 rounded-3xl pb-12">
        
        {/* LEFT SIDE: Hero Image Canvas (45%) */}
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-auto rounded-3xl overflow-hidden flex flex-col justify-end p-8 shadow-2xl">
          {/* Cinematic Backdrop Image */}
          <img 
            src={AirportImg.src} 
            alt="Airport Transfer Hero"
            className="absolute inset-0 w-full h-full object-cover object-center" 
          />
          {/* Layered Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

          <div className="relative z-20 w-full animate-in slide-in-from-bottom-8 fade-in duration-1000">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Airport Pickup & Flight Tracking
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 font-light">
              Share your flight details and our chauffeurs will be ready when you land.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white">
                <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-accent/20 border border-accent/20 text-accent">
                  <Plane className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium tracking-wide">Flight Tracking</span>
              </div>
              <div className="flex items-center gap-4 text-white">
                <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-accent/20 border border-accent/20 text-accent">
                  <Clock4 className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium tracking-wide">Free Waiting Time</span>
              </div>
              <div className="flex items-center gap-4 text-white">
                <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-accent/20 border border-accent/20 text-accent">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium tracking-wide">Professional Drivers</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Booking Form Canvas (55%) */}
        <div className="flex items-center justify-center lg:py-6 relative z-20">
          
          <div className="w-full max-w-[620px] bg-white/5 dark:bg-black/40 backdrop-blur-xl rounded-[16px] border border-border/30 p-6 md:p-8 shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
            
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center text-center py-16 animate-in zoom-in-95 fade-in duration-500">
                <div className="w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mb-8">
                  <CheckCircle2 className="w-12 h-12 text-accent" />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                  Request Sent
                </h2>
                <p className="text-foreground/70 text-lg leading-relaxed max-w-sm mb-8 font-light">
                  {t("airportTransfers.success")}
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="px-8 py-4 rounded-xl border-2 border-border font-bold text-foreground hover:border-foreground/30 hover:bg-foreground/5 transition-all text-sm"
                >
                  Submit New Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                
                {/* SECTION 1: Personal Details */}
                <section className="space-y-4">
                  <header className="flex flex-col gap-1 border-b border-border/30 pb-3">
                    <span className="text-accent font-bold tracking-widest text-[10px] uppercase">Step 01</span>
                    <h3 className="text-xl font-bold text-foreground">Passenger Details</h3>
                  </header>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-semibold text-foreground/70 tracking-wide uppercase">{t("airportTransfers.form.name")}</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full h-11 px-4 text-sm rounded-xl bg-bg-light/80 dark:bg-bg-dark/80 border border-border focus:border-accent focus:bg-background outline-none transition-all placeholder:text-foreground/30 text-foreground" placeholder="Full Name" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-foreground/70 tracking-wide uppercase">{t("airportTransfers.form.email")}</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full h-11 px-4 text-sm rounded-xl bg-bg-light/80 dark:bg-bg-dark/80 border border-border focus:border-accent focus:bg-background outline-none transition-all placeholder:text-foreground/30 text-foreground" placeholder="Email Address" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-foreground/70 tracking-wide uppercase">{t("airportTransfers.form.phone")}</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full h-11 px-4 text-sm rounded-xl bg-bg-light/80 dark:bg-bg-dark/80 border border-border focus:border-accent focus:bg-background outline-none transition-all placeholder:text-foreground/30 text-foreground" placeholder="Phone Number" />
                    </div>
                  </div>
                </section>

                {/* SECTION 2: Flight Details */}
                <section className="space-y-4">
                  <header className="flex flex-col gap-1 border-b border-border/30 pb-3">
                    <span className="text-accent font-bold tracking-widest text-[10px] uppercase">Step 02</span>
                    <h3 className="text-xl font-bold text-foreground">Flight Information</h3>
                  </header>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-foreground/70 tracking-wide uppercase">{t("airportTransfers.form.airport")}</label>
                      <select required name="airport" value={formData.airport} onChange={handleChange} className="w-full h-11 px-3 text-sm rounded-xl bg-bg-light/80 dark:bg-bg-dark/80 border border-border focus:border-accent focus:bg-background outline-none transition-all text-foreground appearance-none cursor-pointer">
                        <option value="" disabled>Select Airport</option>
                        <option value="cai">Cairo (CAI)</option>
                        <option value="hrg">Hurghada (HRG)</option>
                        <option value="ssh">Sharm (SSH)</option>
                        <option value="hbe">Borg El Arab</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-foreground/70 tracking-wide uppercase">{t("airportTransfers.form.flightNumber")}</label>
                      <input required type="text" name="flightNumber" value={formData.flightNumber} onChange={handleChange} className="w-full h-11 px-4 text-sm font-bold uppercase tracking-widest rounded-xl bg-bg-light/80 dark:bg-bg-dark/80 border border-border focus:border-accent focus:bg-background outline-none transition-all placeholder:text-foreground/30 text-foreground" placeholder="e.g. MS798" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-foreground/70 tracking-wide uppercase">{t("airportTransfers.form.arrivalDate")}</label>
                      <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full h-11 px-4 text-sm rounded-xl bg-bg-light/80 dark:bg-bg-dark/80 border border-border focus:border-accent focus:bg-background outline-none transition-all text-foreground [color-scheme:light] dark:[color-scheme:dark] cursor-pointer" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-foreground/70 tracking-wide uppercase">{t("airportTransfers.form.arrivalTime")}</label>
                      <input required type="time" name="time" value={formData.time} onChange={handleChange} className="w-full h-11 px-4 text-sm rounded-xl bg-bg-light/80 dark:bg-bg-dark/80 border border-border focus:border-accent focus:bg-background outline-none transition-all text-foreground [color-scheme:light] dark:[color-scheme:dark] cursor-pointer" />
                    </div>
                    
                    {/* Upload Dropzone */}
                    <label className="col-span-2 mt-1 border border-dashed border-border hover:border-accent/50 hover:bg-accent/5 rounded-xl p-3 flex items-center justify-center gap-3 text-left bg-bg-light/30 dark:bg-bg-dark/30 transition-all cursor-pointer group/upload">
                      <div className="w-8 h-8 rounded-full bg-background border border-border flex shrink-0 items-center justify-center group-hover/upload:border-accent/50 group-hover/upload:scale-110 transition-all shadow-sm">
                        <UploadCloud className="w-4 h-4 text-foreground/60 group-hover/upload:text-accent transition-colors" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-semibold text-foreground truncate">{file ? file.name : t("airportTransfers.form.uploadLabel")}</p>
                        <p className="text-[9px] text-foreground/50 font-medium uppercase tracking-wider">{t("airportTransfers.form.uploadSupported")}</p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                    </label>
                  </div>
                </section>

                {/* SECTION 3: Journey Requirements */}
                <section className="space-y-4">
                  <header className="flex flex-col gap-1 border-b border-border/30 pb-3">
                    <span className="text-accent font-bold tracking-widest text-[10px] uppercase">Step 03</span>
                    <h3 className="text-xl font-bold text-foreground">Journey Details</h3>
                  </header>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-foreground/70 tracking-wide uppercase">{t("airportTransfers.form.pax")}</label>
                      <input required type="number" min="1" max="50" name="pax" value={formData.pax} onChange={handleChange} className="w-full h-11 px-4 text-sm font-bold rounded-xl bg-bg-light/80 dark:bg-bg-dark/80 border border-border focus:border-accent focus:bg-background outline-none transition-all text-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-foreground/70 tracking-wide uppercase">{t("airportTransfers.form.luggage")}</label>
                      <input required type="number" min="0" max="50" name="luggage" value={formData.luggage} onChange={handleChange} className="w-full h-11 px-4 text-sm font-bold rounded-xl bg-bg-light/80 dark:bg-bg-dark/80 border border-border focus:border-accent focus:bg-background outline-none transition-all text-foreground" />
                    </div>
                    <div className="space-y-1.5 col-span-2 md:col-span-1">
                      <label className="text-[11px] font-semibold text-foreground/70 tracking-wide uppercase">{t("airportTransfers.form.pickup")}</label>
                      <input required type="text" name="pickup" value={formData.pickup} onChange={handleChange} className="w-full h-11 px-4 text-sm rounded-xl bg-bg-light/80 dark:bg-bg-dark/80 border border-border focus:border-accent focus:bg-background outline-none transition-all placeholder:text-foreground/30 text-foreground" placeholder="Pickup Location" />
                    </div>
                    <div className="space-y-1.5 col-span-2 md:col-span-1">
                      <label className="text-[11px] font-semibold text-foreground/70 tracking-wide uppercase">{t("airportTransfers.form.dropoff")}</label>
                      <input required type="text" name="dropoff" value={formData.dropoff} onChange={handleChange} className="w-full h-11 px-4 text-sm rounded-xl bg-bg-light/80 dark:bg-bg-dark/80 border border-border focus:border-accent focus:bg-background outline-none transition-all placeholder:text-foreground/30 text-foreground" placeholder="Drop-off Location" />
                    </div>
                  </div>
                </section>

                {/* Submit Action */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 mt-2 bg-accent text-accent-foreground text-sm font-bold tracking-wide uppercase rounded-xl hover:bg-accent/90 focus:ring-4 focus:ring-accent/50 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-lg shadow-accent/20 disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-accent-foreground/20 border-t-accent-foreground rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Request Airport Pickup"
                  )}
                </button>

              </form>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}
