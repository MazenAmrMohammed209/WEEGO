"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Map, Radio, Navigation, PlaneLanding,
  UserCircle2, CarFront, Briefcase, Users, FileText,
  LifeBuoy, ShieldCheck, Settings, LogOut, Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const pathname = usePathname();
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();

  const handlePrefetch = async (href: string) => {
    if (href === "/admin/dashboard") {
      const { fetchAdminDashboardStats } = await import("@/lib/supabaseActions");
      queryClient.prefetchQuery({ queryKey: ["adminDashboardStats"], queryFn: fetchAdminDashboardStats, staleTime: 5 * 60 * 1000 });
    } else if (href === "/admin/bookings") {
      const { fetchAllBookings } = await import("@/lib/supabaseActions");
      queryClient.prefetchQuery({ queryKey: ["adminBookings", 1, "", "all", ""], queryFn: () => fetchAllBookings(1, 5, "", "all", ""), staleTime: 5 * 60 * 1000 });
    } else if (href === "/admin/drivers") {
      const { fetchAdminDrivers } = await import("@/lib/supabaseActions");
      queryClient.prefetchQuery({ queryKey: ["adminDrivers", 1, ""], queryFn: () => fetchAdminDrivers(1, 5, ""), staleTime: 5 * 60 * 1000 });
    } else if (href === "/admin/vehicles") {
      const { fetchAdminVehicles } = await import("@/lib/supabaseActions");
      queryClient.prefetchQuery({ queryKey: ["adminVehicles", 1, ""], queryFn: () => fetchAdminVehicles(1, 5, ""), staleTime: 5 * 60 * 1000 });
    } else if (href === "/admin/finance") {
      const { fetchFinanceData } = await import("@/lib/supabaseActions");
      queryClient.prefetchQuery({ queryKey: ["financeData"], queryFn: fetchFinanceData, staleTime: 5 * 60 * 1000 });
    }
  };

  React.useEffect(() => {
    // Redirect if definitely not admin once auth loading is finished
    if (!isAuthLoading && (!user || user.role !== "admin")) {
      window.location.href = "/";
    }
  }, [user, isAuthLoading]);

  const sidebarLinks = [
    { name: t("admin.sidebar.dashboard") || "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: t("admin.sidebar.bookings") || "Bookings", href: "/admin/bookings", icon: Briefcase },
    { name: t("admin.sidebar.fleet") || "Fleet Tracker", href: "/admin/fleet", icon: Navigation, disabled: true },
    { name: t("admin.sidebar.airport") || "Airport Pickups", href: "/admin/airport-requests", icon: PlaneLanding },
    { name: t("admin.sidebar.drivers") || "Drivers", href: "/admin/drivers", icon: Users },
    { name: t("admin.sidebar.vehicles") || "Vehicles", href: "/admin/vehicles", icon: CarFront },
    { name: t("admin.sidebar.corporate") || "Corporate Accounts", href: "/admin/corporate", icon: Briefcase },
    { name: t("admin.sidebar.crm") || "Sales Leads CRM", href: "/admin/crm", icon: Users, disabled: true },
    { name: t("admin.sidebar.finance") || "Finance & Invoices", href: "/admin/finance", icon: FileText },
    { name: t("admin.sidebar.support") || "Support Tickets", href: "/admin/support", icon: LifeBuoy, disabled: true },
    { name: t("admin.sidebar.staff") || "Staff & Roles", href: "/admin/staff", icon: ShieldCheck, disabled: true },
    { name: t("admin.sidebar.settings") || "Settings", href: "/admin/settings", icon: Settings, disabled: true },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("weego_role");
    window.location.href = "/";
  };


  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ff9d]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-white font-sans selection:bg-[#00ff9d]/30">

      {/* Sidebar Focus Area */}
      <aside className={`hidden w-72 flex-col border-r border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sm:flex fixed left-0 top-0 h-full z-[1001] shadow-[4px_0_24px_rgba(0,0,0,0.5)] ${lang === 'ar' ? 'rtl' : 'ltr'}`}>

        {/* Logo Section removed since it is in global Navbar */}
        <div className="flex h-6 items-center px-8 border-b border-white/5 bg-black/20" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));

            if (link.disabled) {
              return (
                <div
                  key={link.name}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 opacity-25 cursor-not-allowed pointer-events-none"
                >
                  <link.icon className="h-5 w-5 text-white/40" />
                  <span className="font-medium text-sm tracking-wide text-white/40">{link.name}</span>
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                onMouseEnter={() => handlePrefetch(link.href)}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 relative ${isActive
                  ? "bg-gradient-to-r from-[#00ff9d]/10 to-transparent text-[#00ff9d] shadow-[inset_2px_0_0_#00ff9d]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <link.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]' : 'group-hover:scale-110'}`} />
                <span className="font-medium text-sm tracking-wide">{link.name}</span>

                {/* Active glow effect */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00ff9d] rounded-r-full blur-[2px] opacity-70" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-white/5 p-4 bg-black/20 backdrop-blur-md">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-white/5 hover:border-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            {t("admin.sidebar.logout") || "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content Space */}
      <div className={`flex flex-1 flex-col overflow-hidden relative sm:ml-72 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>

        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00ff9d]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto mt-15 p-4 sm:p-8 relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}
