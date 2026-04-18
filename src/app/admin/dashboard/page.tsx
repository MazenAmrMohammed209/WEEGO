"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, CalendarDays, Navigation, CarFront, PlaneLanding, Briefcase,
  CheckCircle2, AlertCircle, Calendar, User, Loader2
} from "lucide-react";
import { fetchAdminDashboardStats } from "@/lib/supabaseActions";
import { useLanguage } from "@/context/LanguageContext";
import { CardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const RevenueChart = dynamic(() => import("@/components/admin/RevenueChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [revenueFilter, setRevenueFilter] = useState("1M");
  const queryClient = useQueryClient();

  const { data: analytics, isLoading, error, isError } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      const { data, error } = await fetchAdminDashboardStats();
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    // Setup Realtime Subscription for Bookings (main driver of dashboard stats)
    import("@/lib/supabase").then(({ supabase }) => {
      const channel = supabase
        .channel("admin_dashboard_realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookings" },
          (payload) => {
            console.log("Dashboard Realtime Update, refreshing cache securely:", payload);
            queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 w-full animate-in fade-in max-w-full overflow-hidden">
         <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 w-full">
            {Array.from({length: 6}).map((_, i) => <CardSkeleton key={i} />)}
         </section>
         <ChartSkeleton />
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <TableSkeleton rows={4} columns={2} />
            <TableSkeleton rows={4} columns={3} />
         </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="flex min-h-[500px] w-full items-center justify-center flex-col gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-white">Error Loading Dashboard</h2>
        <p className="text-white/60">{error instanceof Error ? error.message : "Failed to fetch data or unauthorized"}</p>
      </div>
    );
  }

  const statCards = [
    { title: t("admin.dashboard.totalRevenue") || "Total Revenue", value: `$${Number(analytics.totalRevenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign },
    { title: t("admin.dashboard.totalBookings") || "Total Bookings", value: analytics.totalBookings.toLocaleString(), icon: CalendarDays },
    { title: t("admin.dashboard.activeTrips") || "Active Trips", value: analytics.activeTrips.toString(), icon: Navigation },
    { title: t("admin.dashboard.activeVehicles") || "Active Vehicles", value: analytics.activeVehicles.toString(), icon: CarFront },
    { title: t("admin.dashboard.airportPickups") || "Airport Pickups", value: analytics.airportPickups.toString(), icon: PlaneLanding },
    { title: t("admin.dashboard.corporateClients") || "Corporate Clients", value: analytics.corporateClients.toString(), icon: Briefcase },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* SECTION 1: ANALYTICS CARDS */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a]/50 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[#00ff9d]/10 hover:border-white/10"
          >
            {/* Glow on hover */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#00ff9d]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70 group-hover:text-[#00ff9d] transition-colors">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-medium text-white/50 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* SECTION 2: REVENUE ANALYTICS */}
      <section className="rounded-3xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md p-6 shadow-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ff9d]/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{t("admin.dashboard.revenueAnalytics") || "Revenue Analytics"}</h2>
            <p className="text-sm text-white/50">{t("admin.dashboard.revenueSub") || "B2B vs B2C Revenue Streams"}</p>
          </div>
          
          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
            {["7D", "1M", "3M", "1Y"].map((filter) => (
              <button
                key={filter}
                onClick={() => setRevenueFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  revenueFilter === filter 
                    ? "bg-[#00ff9d] text-black shadow-[0_0_10px_rgba(0,255,157,0.3)]" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic SVG Line Chart */}
        <RevenueChart payments={analytics.payments || []} invoices={analytics.invoices || []} filter={revenueFilter} />
      </section>

      {/* TWO COLUMN BOTTOM LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 3: POPULAR DESTINATIONS */}
        <section className="rounded-3xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">{t("admin.dashboard.popularDestinations") || "Popular Destinations"}</h2>
          <div className="space-y-6">
            {analytics.popularDestinations.length === 0 ? (
               <p className="text-white/50 text-sm">No destinations tracked yet.</p>
            ) : analytics.popularDestinations.map((dest: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-white/80 max-w-[200px] truncate">{dest.name}</span>
                  <span className="font-bold text-[#00ff9d]">{dest.count} trips</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-gradient-to-r from-emerald-500 to-[#00ff9d] rounded-full relative"
                     style={{ width: `${Math.min(dest.percent, 100)}%` }}
                     aria-label="Progress"
                   >
                     <div className="absolute inset-0 bg-white/20 w-1/3 skew-x-12 animate-[shimmer_2s_infinite]" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: RECENT ACTIVITY */}
        <section className="rounded-3xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md p-6 shadow-xl">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{t("admin.dashboard.recentActivity") || "Recent Activity"}</h2>
           </div>
           <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#00ff9d]/50 before:via-white/10 before:to-transparent pl-12 md:pl-0">
              
              {analytics.bookings.length === 0 ? (
                 <div className="pl-4 pb-4">
                   <p className="text-white/50 text-sm">No recent activity.</p>
                 </div>
              ) : analytics.bookings.slice(0, 4).map((booking: any, i: number) => {
                let event = {
                  title: "New Booking Created",
                  desc: booking.users ? `Passenger: ${booking.users.first_name}` : `Booking Ref: ${booking.reference_number || "Unknown"}`,
                  time: new Date(booking.created_at).toLocaleDateString(),
                  icon: CalendarDays,
                  color: "bg-blue-500 text-white"
                };
                if (booking.status === 'completed') {
                   event = { title: "Trip Completed", desc: `To ${booking.dropoff_location || "Destination"}`, time: new Date(booking.updated_at || booking.created_at).toLocaleDateString(), icon: CheckCircle2, color: "bg-emerald-600 text-white" };
                } else if (booking.status === 'in_progress') {
                   event = { title: "Trip Started", desc: `From ${booking.pickup_location || "Pickup"}`, time: new Date(booking.updated_at || booking.created_at).toLocaleDateString(), icon: CarFront, color: "bg-[#00ff9d] text-black" };
                } else if (booking.status === 'assigned') {
                   event = { title: "Driver Assigned", desc: `To Trip ${booking.reference_number || "#"}`, time: new Date(booking.updated_at || booking.created_at).toLocaleDateString(), icon: User, color: "bg-indigo-500 text-white" };
                }
                
                return (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group border-white/5 pb-8 last:pb-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0a0a0a] bg-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm absolute left-0 md:left-1/2 -ml-5 md:ml-0 z-10 transition-transform group-hover:scale-110">
                       <div className={`h-6 w-6 rounded-full flex items-center justify-center ${event.color}`}>
                         <event.icon className="h-3 w-3" />
                       </div>
                    </div>
                    <div className="w-full md:w-[calc(50%-2.5rem)] rounded-xl border border-white/5 bg-black/40 p-4 shadow-sm backdrop-blur-sm transition-all hover:bg-white/5 hover:border-white/10">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00ff9d]">{event.time}</span>
                        <h4 className="text-sm font-bold text-white">{event.title}</h4>
                        <p className="text-xs text-white/50 truncate max-w-[200px]">{event.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

           </div>
        </section>

      </div>

    </div>
  );
}
