"use client";

import { useAuth } from "@/context/AuthContext";
import { ArrowRight, PlaneTakeoff, Heart, Gift, Navigation, Clock, UserCheck, Copy, Check, MapPin, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { Booking } from "@/lib/supabaseActions";
import { supabase } from "@/lib/supabase";
import { translations } from "@/lib/translations";
import { usePagination } from "@/hooks/usePagination";
import dynamic from "next/dynamic";
const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });
import 'react-phone-input-2/lib/style.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const { next, prev, jump, currentData, currentPage, totalPages } = usePagination(bookings, 5);

  // Guest States
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCountry, setGuestCountry] = useState("eg");
  const [hasEnteredGuest, setHasEnteredGuest] = useState(false);

  const loadBookings = async (phoneToSearch?: string) => {
    try {
      setFetchError("");
      setIsLoadingBookings(true);
      const { data: { session } } = await supabase.auth.getSession();

      let query = supabase
        .from('bookings')
        .select('*, vehicle_categories(id, name, capacity)')
        .order('created_at', { ascending: false });

      if (session?.user) {
        query = query.eq('customer_id', session.user.id);
      } else if (phoneToSearch) {
        query = query.eq('customer_phone', phoneToSearch);
      } else {
        setBookings([]);
        setIsLoadingBookings(false);
        return;
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) setBookings(data);
    } catch (err: unknown) {
      const currentErr = err instanceof Error ? err : new Error(String(err));
      console.error("Failed to load bookings:", currentErr);
      setFetchError(currentErr.message || "Failed to load bookings");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  const fetchPoints = async (phoneToSearch?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      let query = supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'accepted');

      if (session?.user) {
        query = query.eq('customer_id', session.user.id);
      } else if (phoneToSearch) {
        query = query.eq('customer_phone', phoneToSearch);
      } else {
        setLoyaltyPoints(0);
        return;
      }

      const { count, error } = await query;
      if (error) {
        console.error("Points fetch error:", error);
        return;
      }

      setLoyaltyPoints((count || 0) * 150);
    } catch (err) {
      console.error("Points fetch error:", err);
    }
  };

  useEffect(() => {
    loadBookings();
    fetchPoints();

    const channel = supabase.channel('bookings-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        async (payload: any) => {
          if (payload.eventType === 'DELETE') {
            setBookings(prev => prev.filter(b => b.id !== payload.old.id));
          } else {
            // Fetch single hydrated record for INSERT/UPDATE
            const { data } = await supabase
              .from('bookings')
              .select('*, vehicle_categories(id, name, capacity)')
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setBookings(prev => {
                if (payload.eventType === 'INSERT') {
                  if (prev.some(b => b.id === data.id)) return prev;
                  return [data, ...prev];
                } else if (payload.eventType === 'UPDATE') {
                  return prev.map(b => b.id === data.id ? data : b);
                }
                return prev;
              });
            }
          }
          
          if (payload.new && payload.new.status === 'accepted' && (!payload.old || payload.old.status !== 'accepted')) {
             setLoyaltyPoints(prev => prev + 150);
          } else if (payload.old && payload.old.status === 'accepted' && payload.new && payload.new.status !== 'accepted') {
             setLoyaltyPoints(prev => Math.max(0, prev - 150));
          } else {
             fetchPoints();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const upcomingTripsCount = bookings.filter(b => ["pending", "confirmed"].includes(b.status)).length;
  const totalTrips = bookings.length;
  const referralCode = "WEEGO-" + (user?.name?.substring(0, 3).toUpperCase() || "USR") + "26";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user && !hasEnteredGuest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-bg-light dark:bg-bg-dark border border-border shadow-2xl rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
          <h2 className="text-2xl font-black text-foreground mb-2 relative z-10">Find Your Booking</h2>
          <p className="text-sm font-medium text-foreground/60 mb-8 relative z-10">Enter the phone number you used to book your trip.</p>

          <div className="text-start mb-6 relative z-10" dir="ltr">
            <style jsx global>{`
                .phone-container-guest { width: 100%; }
                .phone-input-field-guest { width: 100% !important; height: 50.4px !important; border-radius: 12px !important; background: transparent !important; border: 1px solid #2a2a2a !important; color: inherit !important; padding-left: 60px !important; font-weight: 500 !important; }
                html.light .phone-input-field-guest { border-color: #e2e8f0 !important; }
                .phone-dropdown-button-guest { border-radius: 12px 0 0 12px !important; background: transparent !important; border: none !important; }
                .phone-dropdown-guest { background: #0f172a !important; color: white !important; max-height: 250px !important; overflow-y: auto !important; z-index: 9999 !important; border-radius: 10px !important; }
                html.light .phone-dropdown-guest { background: white !important; color: black !important; }
             `}</style>
            <PhoneInput
              country={guestCountry}
              enableSearch={true}
              value={guestPhone}
              onChange={(value, country: { countryCode?: string } | unknown) => { setGuestPhone(value); if (country && typeof country === 'object' && 'countryCode' in country) setGuestCountry((country as { countryCode: string }).countryCode); }}
              excludeCountries={['il']}
              inputClass="phone-input-field-guest flex-1 w-full bg-background border-border text-foreground"
              buttonClass="phone-dropdown-button-guest"
              dropdownClass="phone-dropdown-guest"
              containerClass="phone-container-guest"
            />
          </div>

          <button
            onClick={() => {
              if (guestPhone.length > 7) {
                setHasEnteredGuest(true);
                loadBookings(guestPhone);
                fetchPoints(guestPhone);
              }
            }}
            disabled={guestPhone.length < 8}
            className="w-full relative z-10 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-4 text-sm font-bold text-accent-foreground transition-all hover:bg-accent/90 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            Search Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">

      {/* 1. Welcome Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary text-white shadow-2xl">
        <div className="absolute top-0 right-0 h-96 w-96 bg-accent/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

        <div className="relative z-10 p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
              {t("dashboard.welcome")}<span className="text-accent">{user ? user.name?.split(" ")[0] : "Guest"}</span>
            </h2>
            <p className="text-lg text-primary-foreground/80 font-medium">
              {t("dashboard.upcomingTrips").replace("{count}", upcomingTripsCount.toString())}
            </p>
          </div>
          <div className="relative group">
            <div
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-accent px-8 text-base font-bold text-accent-foreground shadow-lg transition-all opacity-80 cursor-not-allowed"
            >
              {t("dashboard.planTrip")}
              <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </div>
            <span className="absolute -top-3 -right-2 bg-primary text-red-500 text-[10px] font-black px-3 py-1 rounded-full border border-red-500/30 shadow-xl uppercase tracking-wider animate-bounce-slow">
              {t("dashboard.comingSoon")}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: t("dashboard.stats.totalTrips.title"), value: totalTrips.toString(), icon: Navigation, desc: t("dashboard.stats.totalTrips.desc") },
          { title: t("dashboard.stats.upcomingTrips.title"), value: upcomingTripsCount.toString(), icon: Clock, desc: t("dashboard.stats.upcomingTrips.desc"), highlight: true },
          { title: t("dashboard.stats.loyaltyPoints.title"), value: loyaltyPoints.toLocaleString(), icon: Gift, desc: t("dashboard.stats.loyaltyPoints.desc"), highlight: true },
        ].map((stat, idx) => (
          <div key={idx} className="rounded-3xl border border-border bg-background p-6 shadow-sm flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.highlight ? 'bg-accent/10 text-accent' : 'bg-primary/5 text-primary dark:text-primary-foreground'}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-sm font-semibold text-foreground/60 mb-1">{stat.title}</p>
              <h4 className="text-3xl font-extrabold text-foreground mb-1">{stat.value}</h4>
              <p className="text-xs font-medium text-foreground/40">{stat.desc}</p>
            </div>
          </div>
        ))}

        {/* 3. Referral Section (4th Card) */}
        <div className="rounded-3xl border border-border bg-background p-6 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute -top-10 -right-12 h-32 w-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-auto relative z-10 flex flex-col flex-1 pb-1">
            <p className="text-sm font-semibold text-foreground/60 mb-1">{t("dashboard.referral.title1")}</p>
            <h4 className="text-sm sm:text-base font-extrabold text-foreground mb-1 leading-tight line-clamp-1">
              {t("dashboard.referral.title1")} {t("dashboard.referral.title2")}
            </h4>
            <div className="mt-auto pt-2 flex items-center gap-2 p-1.5 pl-3 rounded-xl border border-border bg-bg-light dark:bg-bg-dark">
              <span className="text-xs font-extrabold tracking-widest text-primary dark:text-primary-foreground flex-1 truncate">
                {referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="h-8 px-3 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Recent Trips Section */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-foreground">{t("dashboard.recentTrips.title")}</h3>

        </div>
        <div className="rounded-3xl border border-border bg-background overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border/50 bg-bg-light dark:bg-bg-dark/50">
                  <th className="p-5 text-sm font-bold text-foreground/70 uppercase tracking-wider">{t("dashboard.recentTrips.columns.destination")}</th>
                  <th className="p-5 text-sm font-bold text-foreground/70 uppercase tracking-wider">{t("dashboard.recentTrips.columns.date")}</th>
                  <th className="p-5 text-sm font-bold text-foreground/70 uppercase tracking-wider">{t("dashboard.recentTrips.columns.vehicle")}</th>
                  <th className="p-5 text-sm font-bold text-foreground/70 uppercase tracking-wider">{t("dashboard.recentTrips.columns.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoadingBookings ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center">
                      <div className="flex flex-col items-center justify-center text-foreground/50">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mb-2"></div>
                        <span className="text-sm font-bold">Loading your trips...</span>
                      </div>
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-sm font-bold text-red-500 bg-red-500/5">{fetchError}</td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center">
                      <div className="flex flex-col items-center justify-center text-foreground/50">
                        <MapPin className="h-10 w-10 mb-2 opacity-50" />
                        <span className="text-sm font-bold">No trips yet.</span>
                        <span className="text-xs font-medium mt-1">Let's plan your first one!</span>
                      </div>
                    </td>
                  </tr>
                ) : currentData.map((trip) => {
                  const statusColorMap: Record<string, string> = {
                    pending: "text-yellow-500 bg-yellow-500/10",
                    confirmed: "text-blue-500 bg-blue-500/10",
                    assigned: "text-indigo-500 bg-indigo-500/10",
                    in_progress: "text-purple-500 bg-purple-500/10",
                    completed: "text-green-500 bg-green-500/10",
                    cancelled: "text-red-500 bg-red-500/10",
                  };
                  const statusColor = statusColorMap[trip.status] || "text-foreground/50 bg-foreground/5";

                  return (
                    <tr key={trip.id} className="hover:bg-bg-light/50 dark:hover:bg-bg-dark/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/5 text-primary dark:text-primary-foreground">
                            <PlaneTakeoff className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-foreground truncate max-w-[150px]">{trip.dropoff_location}</span>
                        </div>
                      </td>
                      <td className="p-5 text-sm font-medium text-foreground/70">{new Date(trip.created_at).toLocaleDateString()}</td>
                      <td className="p-5 text-sm font-medium text-foreground/70 capitalize">
                        {trip.vehicle_categories?.name || "Standard"}
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                          {translations[lang][trip.status] || trip.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-5  border-border/50 bg-bg-light/30 dark:bg-bg-dark/30">
            <span className="text-sm font-medium text-foreground/60">
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border bg-background hover:bg-bg-light dark:hover:bg-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => jump(page)}
                  className={`h-8 w-8 rounded-lg text-sm font-bold transition-colors ${currentPage === page
                    ? "bg-accent text-accent-foreground"
                    : "border border-border bg-background hover:bg-bg-light dark:hover:bg-bg-dark text-foreground/70"
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={next}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border bg-background hover:bg-bg-light dark:hover:bg-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
