"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "@/app/assets/logo.png";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { PaymentButton } from "./PaymentButton";
import { UserDropdown } from "./UserDropdown";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");

  const navLinks = [
    { name: t("navbar.home"), href: "/" },
    { name: t("navbar.services"), href: "/services" },
    { name: t("navbar.rewards"), href: "/rewards" },
    { name: t("navbar.about"), href: "/about" },
    { name: t("navbar.business"), href: "/business" },
  ];

  return (
    <div
      className={`fixed top-0 z-[1000] pt-4 pb-6 px-4 md:px-8 pointer-events-none flex justify-center transition-all duration-300 ${
        isAdminRoute 
          ? "sm:left-[18rem] sm:w-[calc(100%-18rem)] w-full left-0" 
          : "w-full left-0"
      }`}
      style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0))' }}
    >
      <header className="pointer-events-auto w-full max-w-[1200px] rounded-full bg-background/90 backdrop-blur-[12px] supports-[backdrop-filter]:bg-background/60 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/10 dark:border-white/5 transition-all duration-300">
        <div className="flex w-full h-16 items-center justify-between px-4 sm:px-6 md:px-8 gap-2">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl md:text-2xl tracking-tighter text-primary dark:text-primary-foreground hover:opacity-80 transition-opacity shrink-0">
            <Image src={logoImg} alt="WEEGO" width={200} height={80} className="h-24 md:h-32 w-auto object-contain" />
          </Link>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-x-4 lg:gap-x-8 text-sm font-medium px-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-foreground/80 transition-colors hover:text-primary dark:hover:text-primary-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                className="relative text-accent font-bold transition-colors hover:text-accent/80 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                {t("dashboard.menu.adminDashboard") || "Admin Dashboard"}
              </Link>
            )}
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 shrink-0">
            <LanguageSwitcher />
            <ThemeToggle />
            <PaymentButton className="hidden lg:flex" />
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth?variant=login"
                  className="px-4 py-1.5 lg:px-5 lg:py-2 text-xs lg:text-sm font-semibold text-foreground border border-border rounded-full hover:bg-accent/5 transition-all active:scale-95 whitespace-nowrap"
                >
                  {t("navbar.login")}
                </Link>
                <Link
                  href="/auth?variant=register"
                  className="px-4 py-1.5 lg:px-5 lg:py-2 text-xs lg:text-sm font-semibold bg-accent text-accent-foreground rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                >
                  {t("navbar.register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Hamburger */}
          <div className="flex items-center md:hidden gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground/80 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="container-base space-y-4 px-4 py-6">
              <nav className="flex flex-col space-y-4 text-sm font-medium">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block text-foreground/80 transition-colors hover:text-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                {isAuthenticated && user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block font-bold text-accent transition-colors hover:text-accent/80"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("dashboard.menu.adminDashboard") || "Admin Dashboard"}
                  </Link>
                )}
              </nav>
              <div className="h-px w-full bg-border my-4" />
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <LanguageSwitcher />
                  {isAuthenticated && <UserDropdown />}
                </div>
                <PaymentButton className="w-full" />
                {!isAuthenticated && (
                  <div className="flex flex-col space-y-3 pt-2">
                    <Link
                      href="/auth?variant=login"
                      className="w-full text-center px-4 py-2.5 text-sm font-semibold text-foreground border border-border rounded-full hover:bg-accent/5 transition-all active:scale-95"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("navbar.login")}
                    </Link>
                    <Link
                      href="/auth?variant=register"
                      className="w-full text-center px-4 py-2.5 text-sm font-semibold bg-accent text-accent-foreground rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("navbar.register")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
