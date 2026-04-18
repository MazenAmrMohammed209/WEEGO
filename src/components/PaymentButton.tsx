"use client";

import { Map } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface PaymentButtonProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  className?: string;
}

export function PaymentButton({ className, ...props }: PaymentButtonProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-full bg-accent/90 px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-all cursor-not-allowed group",
        className
      )}
      {...props as any}
    >
      <Map className="h-4 w-4 rtl:scale-x-[-1]" />
      {t("navbar.planTrip")}
      <span className="absolute -top-3 -right-1 bg-primary text-red-500 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-500/30 shadow-[0_2px_10px_rgba(0,0,0,0.3)] uppercase tracking-tight animate-bounce-slow">
        {t("navbar.comingSoon")}
      </span>
    </div>
  );
}
