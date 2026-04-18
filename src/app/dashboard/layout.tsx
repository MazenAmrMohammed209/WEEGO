"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, Bell, Gift, Settings, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Basic auth check
    const weegoUser = localStorage.getItem("weego_user");
    if (weegoUser) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(true); // Allow guests to access dashboard/my bookings using phone
    }
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (isAuthorized === null || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg-light dark:bg-bg-dark">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const sidebarLinks = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { name: "My Bookings", icon: Map, href: "/dashboard" },
    { name: "Notifications", icon: Bell, href: "/dashboard" },
    { name: "Rewards", icon: Gift, href: "/dashboard" },
    { name: "Settings", icon: Settings, href: "/dashboard" },
  ];

  const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="bg-bg-light dark:bg-bg-dark pt-32 pb-24 min-h-screen">
      <div className="container-base">
        {children}
      </div>
    </div>
  );
}
