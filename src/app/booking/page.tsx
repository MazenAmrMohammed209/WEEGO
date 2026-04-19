"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createBooking, createAirportRequest } from "@/lib/supabaseActions";
import { supabase } from "@/lib/supabase";
import { Check, ChevronRight, ChevronLeft, MapPin, Calendar, Users, Briefcase, Car, Loader2, MessageCircle, User as UserIcon } from "lucide-react";
import heroImg from "@/app/assets/heroimg.jpg"; // Using hero image as placeholder if needed
import {
  default as SedanImg
} from "@/app/assets/sedan.webp";
import SuvImg from "@/app/assets/suv.jpg";
import Suv7Img from "@/app/assets/SUV 7.jpg";
import H1Img from "@/app/assets/H1.jpeg";
import HighSImg from "@/app/assets/high s.jpg";
import CoasterImg from "@/app/assets/costar.webp";
import BusImg from "@/app/assets/BUS.jpg";
import dynamic from "next/dynamic";
const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });
import 'react-phone-input-2/lib/style.css';

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 pb-24 text-center">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}

function BookingContent() {
  const { t, lang } = useLanguage();
  const locale = lang || "en";
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initType = searchParams.get("type") === "airport" ? "Airport" : "One Way";

  const [step, setStep] = useState(1);
  const [tripType, setTripType] = useState(initType);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("vehicle_categories")
        .select("*")
        .order("capacity", { ascending: true });

      if (!error && data) {
        setCategories(data);
        console.log("Categories:", data);
      }
    };
    fetchCategories();
  }, []);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledHour, setScheduledHour] = useState("12");
  const [scheduledMinute, setScheduledMinute] = useState("00");
  const [customTime, setCustomTime] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [luggage, setLuggage] = useState("0");
  const [notes, setNotes] = useState("");
  // Airport specific
  const [flightNumber, setFlightNumber] = useState("");
  const [airport, setAirport] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCountry, setCustomerCountry] = useState("eg");

  useEffect(() => {
    if (user && !customerName) {
      setCustomerName(user.name || "");
    }
  }, [user]);

  const [step1Errors, setStep1Errors] = useState<any>({});

  const clearError = (field: string) => {
    setStep1Errors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    setSubmitError("");
  };

  const getVehicleImg = (name: string) => {
    const n = name?.toLowerCase() || "";
    if (n.includes("sedan")) return SedanImg;
    if (n === "suv 4" || (n.includes("suv") && !n.includes("7"))) return SuvImg;
    if (n.includes("suv 7") || n.includes("suv7")) return Suv7Img;
    if (n.includes("h1")) return H1Img;
    if (n.includes("high s") || n.includes("highs")) return HighSImg;
    if (n.includes("coaster") || n.includes("costar")) return CoasterImg;
    if (n.includes("bus")) return BusImg;
    return heroImg;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState("");


  const handleNextStep1 = () => {
    const newErrors: any = {};

    if (!pickupLocation.trim()) { newErrors.pickup = "Pickup location is required"; }
    if (!dropoffLocation.trim()) { newErrors.dropoff = "Dropoff location is required"; }
    if (!scheduledDate) { newErrors.date = "Date is required"; }

    if (tripType === "Airport") {
      if (!flightNumber.trim()) newErrors.flightNumber = "Flight number is required";
      if (!airport.trim()) newErrors.airport = "Airport is required";
    }

    if (customerName.trim().split(/\s+/).length < 4) {
      newErrors.name = "Please enter your full name (4 parts)";
    }
    if (!customerPhone.trim() || customerPhone.length < 8) {
      newErrors.phone = "Please enter a valid WhatsApp phone number";
    }

    if (!passengers || Number(passengers) <= 0 || Number(passengers) > 50) {
      newErrors.passengers = "Enter valid passengers (1-50)";
    }

    if (luggage === null || luggage === undefined || Number(luggage) < 0) {
      newErrors.luggage = "Select number of luggage";
    }

    setStep1Errors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSubmitError("Please complete required fields.");
      setTimeout(() => {
        const errorElement = document.querySelector('.border-red-500');
        if (errorElement) {
          (errorElement as HTMLElement).focus();
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    setSubmitError("");
    setStep(2);
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Combine date and time
      const timeToUse = customTime.trim() || `${scheduledHour.padStart(2, '0')}:${scheduledMinute}`;
      const dateTimeString = `${scheduledDate}T${timeToUse}:00`;
      const scheduledDateTime = new Date(dateTimeString).toISOString();

      const refNum = "WGO-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: sessionData } = await supabase.auth.getSession();
      const customerId = sessionData?.session?.user?.id || undefined;

      const bookingPayload = {
        pickupLocation,
        dropoffLocation,
        scheduledDateTime,
        categoryId: selectedCategory.id,
        refNum,
        customerName,
        customerPhone,
        customerCountry,
        passengers: Number(passengers),
        luggage: Number(luggage),
        customerId,
        category: tripType === "Airport" ? "airport_pickup" : "standard",
        flightNumber: tripType === "Airport" ? flightNumber : undefined,
        arrivalTime: tripType === "Airport" ? scheduledDateTime : undefined
      };

      console.log("Initiating Booking Insert. Payload:", bookingPayload);

      const { data: bookingId, error: bookingError } = await createBooking(
        bookingPayload.pickupLocation,
        bookingPayload.dropoffLocation,
        bookingPayload.scheduledDateTime,
        bookingPayload.refNum,
        bookingPayload.customerName,
        bookingPayload.customerPhone,
        bookingPayload.customerCountry,
        bookingPayload.passengers,
        bookingPayload.luggage,
        bookingPayload.customerId,
        bookingPayload.category,
        bookingPayload.flightNumber,
        bookingPayload.arrivalTime,
        bookingPayload.categoryId
      );

      console.log("BOOKING INSERT:", bookingId, bookingError);

      console.log("STEP 1: Booking success", bookingId);
      console.log("STEP 2: Calling airport insert");

      // FORCED EXECUTION (Ignoring tripType condition)
      const airportPayload = {
        booking_id: bookingId,
        flight_number: flightNumber || "UNKNOWN_FLIGHT",
        arrival_time: scheduledDateTime || new Date().toISOString(),
        passenger_count: Number(passengers) || 1,
        luggage_count: Number(luggage) || 0,
        ticket_file_url: null,
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

      setBookingReference(refNum);
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("Booking flow encountered an error:", err);
      setSubmitError(err.message || "Failed to finalize booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-background pt-32 pb-24 transition-colors duration-300">

      {/* Success Modal */}
      {submitSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-bg-dark border border-border p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3 text-foreground">Booking Confirmed!</h2>
            <p className="text-foreground/70 mb-8 font-medium">Your trip has been successfully requested. We will contact you shortly to confirm the price and driver details.</p>

            <div className="bg-muted rounded-2xl p-5 mb-8 border border-border/50">
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-2">Booking Reference</p>
              <p className="text-3xl font-black tracking-widest text-primary dark:text-primary-foreground">{bookingReference}</p>
            </div>

            <a
              href={`https://wa.me/01505329405, I have a booking with reference ${bookingReference}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-sm font-bold text-white transition-all hover:bg-[#128C7E] hover:shadow-lg active:scale-95 mb-4"
            >
              <MessageCircle className="w-5 h-5" />
              Contact us on WhatsApp
            </a>
            <button onClick={() => router.push("/my-bookings")} className="mt-2 text-sm font-bold text-foreground/60 hover:text-foreground underline decoration-transparent hover:decoration-foreground underline-offset-4 transition-all">
              View My Bookings
            </button>
          </div>
        </div>
      )}

      <div className="container-base relative">

        {/* Top Header */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary dark:text-primary-foreground mb-8">
            {t("booking.title")}
          </h1>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className={`flex items-center gap-3 ${step >= 1 ? 'text-primary dark:text-primary-foreground' : 'text-foreground/40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? 'bg-primary dark:bg-white text-primary-foreground dark:text-primary' : 'bg-muted text-foreground/50'}`}>1</div>
              <span className="font-semibold text-sm hidden sm:block">{t("booking.steps.details")}</span>
            </div>

            <div className={`flex-1 h-0.5 rounded-full ${step >= 2 ? 'bg-primary dark:bg-white' : 'bg-border'}`} />

            <div className={`flex items-center gap-3 ${step >= 2 ? 'text-primary dark:text-primary-foreground' : 'text-foreground/40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 2 ? 'bg-primary dark:bg-white text-primary-foreground dark:text-primary' : 'bg-muted text-foreground/50'}`}>2</div>
              <span className="font-semibold text-sm hidden sm:block">{t("booking.steps.vehicle")}</span>
            </div>

            <div className={`flex-1 h-0.5 rounded-full ${step >= 3 ? 'bg-primary dark:bg-white' : 'bg-border'}`} />

            <div className={`flex items-center gap-3 ${step >= 3 ? 'text-primary dark:text-primary-foreground' : 'text-foreground/40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 3 ? 'bg-primary dark:bg-white text-primary-foreground dark:text-primary' : 'bg-muted text-foreground/50'}`}>3</div>
              <span className="font-semibold text-sm hidden sm:block">{t("booking.steps.review")}</span>
            </div>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid lg:grid-cols-3 gap-8 items-start relative z-10">

          {/* Left Side: Form Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-bg-dark border border-border rounded-3xl p-6 md:p-10 shadow-sm animate-in fade-in slide-in-from-left-8 duration-700 delay-150 relative overflow-hidden">

              {/* Step 1: Trip Details */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <MapPin className="text-accent h-6 w-6" />
                      {t("booking.steps.details")}
                    </h2>
                    {submitError && step === 1 && (
                      <div className="mt-4 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm font-bold flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        {submitError}
                      </div>
                    )}
                  </div>

                  {/* Trip Type Tabs */}
                  <div className="flex p-1.5 bg-muted rounded-full mb-8 overflow-x-auto no-scrollbar shadow-inner">
                    {['One Way', 'Round Trip', 'Multi-City', 'Hourly', 'Airport'].map((type) => {
                      const keyMap: Record<string, string> = {
                        'One Way': 'oneWay', 'Round Trip': 'roundTrip', 'Multi-City': 'multiCity', 'Hourly': 'hourly', 'Airport': 'airport'
                      };
                      return (
                        <button
                          key={type}
                          onClick={() => setTripType(type)}
                          className={`flex-1 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${tripType === type
                            ? 'bg-white dark:bg-[#1f3743] text-primary dark:text-white shadow-md transform scale-[1.02]'
                            : 'text-foreground/70 hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
                            } ${type === 'Airport' && tripType !== type ? 'bg-accent/10 text-accent-foreground/80 hover:bg-accent/20' : ''
                            }`}
                        >
                          {t(`booking.tripType.${keyMap[type]}`)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Form Grid */}
                  <div className="space-y-6">
                    <div className="space-y-6">
                      <div className="relative">
                        <label className="block text-sm font-bold text-foreground mb-2">
                          {tripType === "Airport" ? t("booking.form.pickupLocationAirport") : t("booking.form.pickupLocation")} <span className="text-red-500">*</span>
                        </label>
                        <input value={pickupLocation} onChange={(e) => { setPickupLocation(e.target.value); clearError("pickup"); }} type="text" placeholder={tripType === "Airport" ? t("booking.form.pickupPlaceholder") : t("booking.form.pickupPlaceholder")} className={`w-full bg-background border rounded-xl px-4 py-3.5 pl-11 text-foreground focus:ring-2 focus:ring-accent focus:outline-none font-medium placeholder:text-foreground/40 ${step1Errors.pickup ? 'border-red-500 focus:ring-red-500' : 'border-border'}`} />
                        <MapPin className="absolute left-4 top-[38px] w-5 h-5 text-accent" />
                        {step1Errors.pickup && <p className="text-red-500 text-sm mt-1">{step1Errors.pickup}</p>}
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-bold text-foreground mb-2">
                          {tripType === "Airport" ? t("booking.form.dropoffLocationAirport") : t("booking.form.dropoffLocation")} <span className="text-red-500">*</span>
                        </label>
                        <input value={dropoffLocation} onChange={(e) => { setDropoffLocation(e.target.value); clearError("dropoff"); }} type="text" placeholder={tripType === "Airport" ? t("booking.form.dropoffPlaceholder") : t("booking.form.dropoffPlaceholder")} className={`w-full bg-background border rounded-xl px-4 py-3.5 pl-11 text-foreground focus:ring-2 focus:ring-accent focus:outline-none font-medium placeholder:text-foreground/40 ${step1Errors.dropoff ? 'border-red-500 focus:ring-red-500' : 'border-border'}`} />
                        <MapPin className="absolute left-4 top-[38px] w-5 h-5 text-accent/50" />
                        {step1Errors.dropoff && <p className="text-red-500 text-sm mt-1">{step1Errors.dropoff}</p>}
                      </div>
                    </div>

                    {tripType === "Airport" && (
                      <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-border">
                        <div className="relative">
                          <label className="block text-sm font-bold text-foreground mb-2">
                            {t("booking.form.flightNumber")} <span className="text-red-500">*</span>
                          </label>
                          <input value={flightNumber} onChange={(e) => { setFlightNumber(e.target.value); clearError("flightNumber"); }} type="text" placeholder={t("booking.form.flightPlaceholder")} className={`w-full bg-background border rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-accent focus:outline-none font-medium placeholder:text-foreground/40 ${step1Errors.flightNumber ? 'border-red-500 focus:ring-red-500' : 'border-border'}`} />
                          {step1Errors.flightNumber && <p className="text-red-500 text-sm mt-1">{step1Errors.flightNumber}</p>}
                        </div>
                        <div className="relative">
                          <label className="block text-sm font-bold text-foreground mb-2">
                            {t("booking.form.airport")} <span className="text-red-500">*</span>
                          </label>
                          <input value={airport} onChange={(e) => { setAirport(e.target.value); clearError("airport"); }} type="text" placeholder={t("booking.form.airportPlaceholder")} className={`w-full bg-background border rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-accent focus:outline-none font-medium placeholder:text-foreground/40 ${step1Errors.airport ? 'border-red-500 focus:ring-red-500' : 'border-border'}`} />
                          {step1Errors.airport && <p className="text-red-500 text-sm mt-1">{step1Errors.airport}</p>}
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-border">
                      <div className="relative">
                        <label className="block text-sm font-bold text-foreground mb-2">
                          {t("booking.form.fullName")} <span className="text-red-500">*</span>
                        </label>
                        <input value={customerName} onChange={(e) => { setCustomerName(e.target.value); clearError("name"); }} type="text" placeholder={t("booking.form.fullNamePlaceholder")} className={`w-full bg-background border rounded-xl px-4 py-3.5 pl-11 text-foreground focus:ring-2 focus:ring-accent focus:outline-none font-medium placeholder:text-foreground/40 shadow-sm ${step1Errors.name ? 'border-red-500 focus:ring-red-500' : 'border-border'}`} />
                        <UserIcon className="absolute left-4 top-[38px] w-5 h-5 text-muted-foreground opacity-70" />
                        {step1Errors.name && <p className="text-red-500 text-sm mt-1">{step1Errors.name}</p>}
                      </div>
                      <div className="relative" dir="ltr">
                        <label className="block text-sm font-bold text-foreground mb-2 text-start">
                          {t("booking.form.whatsapp")} <span className="text-red-500">*</span>
                        </label>
                        <style jsx global>{`
                            .phone-container-book { width: 100%; }
                            .phone-input-field-book { width: 100% !important; height: 50.4px !important; border-radius: 12px !important; background: transparent !important; border: 1px solid #2a2a2a !important; color: inherit !important; padding-left: 60px !important; font-weight: 500 !important; }
                            html.light .phone-input-field-book { border-color: #e2e8f0 !important; }
                            .phone-dropdown-button-book { border-radius: 12px 0 0 12px !important; background: transparent !important; border: none !important; }
                            .phone-dropdown-book { background: #0f172a !important; color: white !important; max-height: 250px !important; overflow-y: auto !important; z-index: 9999 !important; border-radius: 10px !important; }
                            html.light .phone-dropdown-book { background: white !important; color: black !important; }
                          `}</style>
                        <div className="block w-full rounded-2xl ring-0 focus-within:ring-2 focus-within:ring-accent transition-all shadow-sm">
                          <PhoneInput
                            country={customerCountry}
                            enableSearch={true}
                            value={customerPhone}
                            onChange={(value, country: any) => { setCustomerPhone(value); if (country?.countryCode) setCustomerCountry(country.countryCode); clearError("phone"); }}
                            excludeCountries={['il']}
                            inputClass={`phone-input-field-book flex-1 w-full bg-background text-foreground ${step1Errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-border border'}`}
                            buttonClass="phone-dropdown-button-book"
                            dropdownClass="phone-dropdown-book"
                            containerClass="phone-container-book"
                            inputProps={{ name: 'phone', required: true }}
                          />
                        </div>
                        {step1Errors.phone && <p className="text-red-500 text-sm mt-1">{step1Errors.phone}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2">
                          {tripType === "Airport" ? t("booking.form.arrivalDate") : t("booking.form.pickupDate")} <span className="text-red-500">*</span>
                        </label>
                        <input value={scheduledDate} onChange={(e) => { setScheduledDate(e.target.value); clearError("date"); }} type="date" className={`w-full bg-background border rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-accent focus:outline-none font-medium ${step1Errors.date ? 'border-red-500 focus:ring-red-500' : 'border-border'}`} />
                        {step1Errors.date && <p className="text-red-500 text-sm mt-1">{step1Errors.date}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2">{tripType === "Airport" ? t("booking.form.arrivalTime") : t("booking.form.time")}</label>
                        <div className="flex gap-2" dir="ltr">
                          <select value={scheduledHour} onChange={(e) => setScheduledHour(e.target.value)} className="w-1/2 bg-background border border-border rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-accent focus:outline-none font-medium appearance-none">
                            {Array.from({ length: 24 }).map((_, i) => (
                              <option key={i} value={i.toString().padStart(2, "0")}>{i.toString().padStart(2, "0")}</option>
                            ))}
                          </select>
                          <span className="flex items-center text-xl font-bold">:</span>
                          <select value={scheduledMinute} onChange={(e) => setScheduledMinute(e.target.value)} className="w-1/2 bg-background border border-border rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-accent focus:outline-none font-medium appearance-none">
                            {["00", "15", "30", "45"].map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <input value={customTime} onChange={(e) => setCustomTime(e.target.value)} type="text" placeholder={t("booking.form.customTime")} className="w-full mt-2 bg-background border border-border rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-accent focus:outline-none font-medium placeholder:text-foreground/40" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2">{t("booking.form.passengers")}</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={passengers}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || (Number(val) >= 0 && Number(val) <= 50)) {
                              setPassengers(val);
                              clearError("passengers");
                            }
                          }}
                          placeholder="Max 50"
                          className={`w-full bg-background border rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-accent focus:outline-none font-medium ${step1Errors.passengers ? 'border-red-500 focus:ring-red-500' : 'border-border'}`}
                        />
                        {step1Errors.passengers && <p className="text-red-500 text-sm mt-1">{step1Errors.passengers}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2">{t("booking.form.luggage")}</label>
                        <select value={luggage} onChange={(e) => { setLuggage(e.target.value); clearError("luggage"); }} className={`w-full bg-background border rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-accent focus:outline-none appearance-none font-medium ${step1Errors.luggage ? 'border-red-500 focus:ring-red-500' : 'border-border'}`}>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => <option key={num} value={num}>{num} {t("booking.form.bags")}</option>)}
                        </select>
                        {step1Errors.luggage && <p className="text-red-500 text-sm mt-1">{step1Errors.luggage}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">{t("booking.form.specialRequests")}</label>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("booking.form.specialRequestsPlaceholder")} rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-accent focus:outline-none font-medium placeholder:text-foreground/40 resize-none"></textarea>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-border flex justify-end">
                    <button
                      onClick={handleNextStep1}
                      disabled={Object.keys(step1Errors).length > 0}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:-translate-y-1 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
                    >
                      {t("booking.buttons.next")}
                      <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Vehicle Category Selection */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <Car className="text-accent h-6 w-6" />
                      {t("booking.vehicleSelection.title") || "Select Vehicle Category"}
                    </h2>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {(() => {
                      const filteredVehicles = categories.filter(v => v.capacity >= Number(passengers));
                      return filteredVehicles.map((cat) => {
                        const isSelected = selectedCategory?.id === cat.id;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat)}
                            className={`relative flex flex-col sm:flex-row items-center cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg ${isSelected ? 'border-accent bg-accent/5 shadow-md' : 'border-border bg-background hover:border-accent/50'}`}
                          >
                            {isSelected && (
                              <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 h-6 w-6 rounded-full bg-accent flex items-center justify-center animate-in zoom-in duration-300">
                                <Check className="h-4 w-4 text-accent-foreground" />
                              </div>
                            )}

                            <div className="relative w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-muted mb-4 sm:mb-0 sm:mr-6 rtl:mr-0 rtl:ml-6 shrink-0 border border-border">
                              <Image src={getVehicleImg(cat.name)} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>

                            <div className="flex-1 w-full text-start">
                              <h3 className="text-xl font-bold text-foreground mb-1 capitalize">{cat.name}</h3>
                              <p className="text-sm font-medium text-foreground/60 mb-3">Premium transport option</p>
                              <div className="flex items-center gap-4 text-xs font-semibold text-foreground/70 mb-2">
                                <span className="flex items-center gap-1.5 bg-bg-light dark:bg-bg-dark px-2 py-1 rounded-md border border-border"><Users className="w-3.5 h-3.5 text-accent" /> Up to {cat.capacity} {t("booking.vehicleSelection.seats")}</span>
                                <span className="flex items-center gap-1.5 bg-bg-light dark:bg-bg-dark px-2 py-1 rounded-md border border-border"><Briefcase className="w-3.5 h-3.5 text-accent" /> Optional Bags</span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <div className="mt-10 pt-8 border-t border-border flex justify-between">
                    <button onClick={handleBack} className="inline-flex items-center justify-center gap-2 rounded-xl bg-background border-2 border-border px-6 py-4 text-sm font-bold text-foreground transition-all hover:bg-muted active:scale-95 focus-visible:outline-none">
                      <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                      {t("booking.buttons.back")}
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!selectedCategory}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedCategory ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 hover:shadow-lg active:scale-95' : 'bg-muted text-foreground/40 cursor-not-allowed'}`}
                    >
                      {t("booking.buttons.next")}
                      <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <Check className="text-accent h-6 w-6" />
                      {t("booking.review.title")}
                    </h2>
                  </div>

                  <div className="bg-bg-light dark:bg-bg-dark/50 border border-border rounded-2xl p-6 md:p-8 space-y-6">
                    <h3 className="text-lg font-bold text-foreground border-b border-border pb-4">{t("booking.review.summary")}</h3>

                    <div className="grid md:grid-cols-2 gap-y-6 gap-x-8">
                      <div>
                        <span className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">{t("booking.review.tripType")}</span>
                        <span className="block font-semibold text-foreground">{tripType}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">{t("booking.review.dateTime")}</span>
                        <span className="block font-semibold text-foreground text-start">{scheduledDate} {customTime.trim() || `${scheduledHour.padStart(2, '0')}:${scheduledMinute}`}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">{t("booking.review.pickup")}</span>
                        <span className="block font-semibold text-foreground">{pickupLocation}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">{t("booking.review.dropoff")}</span>
                        <span className="block font-semibold text-foreground">{dropoffLocation}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Vehicle Category</span>
                        <span className="block font-semibold text-foreground">{selectedCategory?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">{t("booking.review.passengers")}</span>
                        <span className="block font-semibold text-foreground">{passengers} Passengers</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Luggage</span>
                        <span className="block font-semibold text-foreground">{luggage} Bags</span>
                      </div>
                      {notes && (
                        <div className="md:col-span-2 mt-2 bg-background p-4 rounded-xl border border-border">
                          <span className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Notes / Instructions</span>
                          <span className="block font-medium text-foreground/80">{notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {submitError && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm font-bold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      {submitError}
                    </div>
                  )}

                  <div className="mt-10 pt-8 border-t border-border flex justify-between">
                    <button onClick={handleBack} disabled={isSubmitting || submitSuccess} className="inline-flex items-center justify-center gap-2 rounded-xl bg-background border-2 border-border px-6 py-4 text-sm font-bold text-foreground transition-all hover:bg-muted active:scale-95 focus-visible:outline-none disabled:opacity-50">
                      <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                      {t("booking.buttons.back")}
                    </button>
                    <button onClick={handleConfirm} disabled={isSubmitting || submitSuccess} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-sm font-bold text-accent-foreground transition-all hover:bg-accent/90 hover:-translate-y-1 hover:shadow-lg shadow-accent/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-accent">
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      {t("booking.buttons.confirm")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Sticky Info Panel */}
          <div className="lg:col-span-1">
            <div className="bg-primary dark:bg-[#11242d] text-primary-foreground border border-border rounded-3xl p-8 shadow-xl sticky top-32 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-primary-foreground/10">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center -translate-y-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  {t("booking.review.bookingInfo")}
                </h3>
              </div>

              <div className="bg-primary-foreground/5 rounded-2xl p-6 border border-primary-foreground/10 mb-8 text-center animate-pulse">
                <p className="text-lg font-bold text-white mb-2">{t("booking.review.priceMessage")}</p>
                <p className="text-sm text-primary-foreground/70 font-medium">{t("booking.review.priceDesc")}</p>
              </div>

              <div className="bg-primary-foreground/5 rounded-xl p-5 border border-primary-foreground/10">
                <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/70 mb-3">{t("booking.review.priceIncludes")}</p>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-xs font-medium text-primary-foreground/80">
                    <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" /> {t("booking.review.pointTransfer")}
                  </li>
                  <li className="flex items-start gap-2 text-xs font-medium text-primary-foreground/80">
                    <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" /> {t("booking.review.proDriver")}
                  </li>
                  <li className="flex items-start gap-2 text-xs font-medium text-primary-foreground/80">
                    <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" /> {t("booking.review.cleanVehicles")}
                  </li>
                  <li className="flex items-start gap-2 text-xs font-medium text-primary-foreground/80">
                    <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" /> {t("booking.review.customerSupport")}
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
