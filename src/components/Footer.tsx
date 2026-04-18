"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook, ArrowUp, ChevronRight, MessageSquare } from "lucide-react";
import Image from "next/image";
import logoImg from "@/app/assets/logo.png";
import { useLanguage } from "@/context/LanguageContext";
import { usePathname } from "next/navigation";

export default function Footer() {
  const { t, lang } = useLanguage();
  const pathname = usePathname();
  const isRtl = lang === "ar";

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/auth")) {
    return null;
  }

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: MessageSquare, href: "https://wa.me/201505329501", label: "WhatsApp" },
  ];

  const serviceLinks = [
    { name: t("footer.links.premium"), href: "/services" },
    { name: t("footer.links.intercity"), href: "/services" },
    { name: t("footer.links.business"), href: "/business" },
    { name: t("footer.links.vip"), href: "/services" },
  ];

  const companyLinks = [
    { name: t("footer.titles.company"), href: "/about#about" },
    { name: "Why Us", href: "/#why-partner" },
    { name: "Contact", href: "/about#contact" },
    { name: t("footer.privacy"), href: "#" },
    { name: t("footer.terms"), href: "#" },
  ];

  return (
    <footer className="w-full bg-[#0B1E26] text-white pt-24 pb-12 relative overflow-hidden border-t border-white/5">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="container-base relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">

          {/* Column 1: Brand Logo */}
          <div className="space-y-8">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <Image
                src={logoImg}
                alt="WEEGO"
                width={240}
                height={80}
                className="w-56 h-auto object-contain -ms-4"
              />
            </Link>
          </div>

          {/* Column 2: Services */}
          <div>
            <h4 className="text-accent font-bold text-sm tracking-[0.2em] uppercase mb-8">
              {t("footer.titles.services")}
            </h4>
            <ul className="space-y-4">
              {serviceLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className={`h-3 w-3 text-accent/50 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="text-accent font-bold text-sm tracking-[0.2em] uppercase mb-8">
              {t("footer.titles.company") || "Company"}
            </h4>
            <ul className="space-y-4">
              {companyLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className={`h-3 w-3 text-accent/50 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Brand Bio */}
          <div className="space-y-8">
            <div>
              <h4 className="text-accent font-bold text-sm tracking-[0.2em] uppercase mb-8">
                {t("footer.titles.contact") || "Support"}
              </h4>
              <div className="space-y-4">
                <a href="mailto:weego@gmail.com" className="flex items-center gap-4 text-white/80 hover:text-accent transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/30">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span>weego@gmail.com</span>
                </a>
                <a href="tel:01505329501" className="flex items-center gap-4 text-white/80 hover:text-accent transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/30">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span>01505329501</span>
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-white/60 text-base leading-relaxed max-w-xs">
                {t("footer.description") || "Revolutionizing travel across the Middle East with tech-driven chauffeured experiences and premium bus trips."}
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-primary transition-all duration-300 group"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/5 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest text-center md:text-start">
              {t("footer.copyright") || `© ${new Date().getFullYear()} Weego. All rights reserved.`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="h-3 w-3 text-accent/50" />
              <p className="text-[11px] text-white/30 font-medium">{t("footer.address1") || "Cairo, Egypt"}</p>
            </div>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Back to top</span>
            <ArrowUp className="h-4 w-4 text-accent transition-transform group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </footer>
  );
}
