"use client";

import React, { useState, useEffect } from "react";
import { Users, Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import heroImg from "@/app/assets/heroimg.jpg";
import AirportPickupImage from "@/app/assets/Airport Pickup.webp";
import SedanImg from "@/app/assets/sedan.webp";
import SuvImg from "@/app/assets/suv.jpg";
import Suv7Img from "@/app/assets/SUV 7.jpg";
import H1Img from "@/app/assets/H1.jpeg";
import HighSImg from "@/app/assets/high s.jpg";
import CoasterImg from "@/app/assets/costar.webp";
import BusImg from "@/app/assets/BUS.jpg";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { CardSkeleton } from "@/components/ui/Skeleton";

// Interactive client component wrapper for state
export default function ServicesPage() {
  return <ServicesContent />;
}

function ServicesContent() {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicleCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_categories")
        .select("*")
        .order("capacity", { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const fallbackVehicles = [
    { name: "Sedan", capacity: 4 },
    { name: "SUV 4", capacity: 4 },
    { name: "SUV 7", capacity: 7 },
    { name: "H1", capacity: 19 },
    { name: "High S", capacity: 14 },
    { name: "Coaster", capacity: 33 },
    { name: "Bus", capacity: 50 },
  ];

  const displayVehicles = vehicles && vehicles.length > 0 ? vehicles : (isLoading ? [] : fallbackVehicles);

  const getVehicleImage = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("sedan")) return SedanImg;
    if (n === "suv 4" || (n.includes("suv") && !n.includes("7"))) return SuvImg;
    if (n.includes("suv 7") || n.includes("suv7")) return Suv7Img;
    if (n.includes("h1")) return H1Img;
    if (n.includes("high s") || n.includes("highs")) return HighSImg;
    if (n.includes("coaster") || n.includes("costar")) return CoasterImg;
    if (n.includes("bus")) return BusImg;
    return heroImg;
  };

  return (
    <div className="py-32 bg-background min-h-screen">
      <div className="container-base">
        {/* Section Title */}
        <div className="text-center mb-16 animate-in slide-in-from-bottom-8 fade-in duration-700">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-primary dark:text-primary-foreground mb-6">
            Our Fleet
          </h1>
          {/* <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Choose the perfect vehicle for your journey.
          </p> */}
        </div>



        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && !vehicles ? (
            Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          ) : (
            displayVehicles.map((vehicle, idx) => (
              <div
                key={vehicle.id || idx}
                className={`group relative flex flex-col rounded-[2rem] bg-white dark:bg-[#11242d] border border-border overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-8 fill-mode-both`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* TOP: Image & Badge */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <Image
                    src={getVehicleImage(vehicle.name)}
                    alt={vehicle.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                </div>

                {/* Vehicle Information */}
                <div className="flex flex-col flex-1 p-6 md:p-8">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-foreground mb-1">
                      {vehicle.name}
                    </h3>
                  </div>

                  {/* Capacity Label */}
                  <div className="mb-6 inline-flex items-baseline p-3 rounded-2xl bg-accent/10 border border-accent/20 gap-2">
                    <span className="text-sm font-semibold text-foreground/70">Capacity:</span>
                    <span className="text-2xl font-black text-accent">{vehicle.capacity}</span>
                    <span className="text-sm font-bold text-foreground/70">passengers</span>
                  </div>

                  {/* Vehicle Details */}
                  <div className="flex items-center gap-4 mb-6 text-sm font-medium text-foreground/80">
                    <div className="flex items-center gap-1.5" title="Passengers">
                      <Users className="w-4 h-4 text-accent rtl:scale-x-[-1]" />
                      <span>{vehicle.capacity} passengers</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {/* CTA Button */}
                    <Link href="/booking" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:-translate-y-1 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      Book Now
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            )))}
        </div>

        {/* Airport Transfers Informational Block */}
        <div className="mt-24 pt-24 border-t border-border/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text Content */}
            <div className="w-full lg:w-1/2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent mb-6 uppercase tracking-wider">
                Specialized Service
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary dark:text-primary-foreground mb-6">
                Premium Airport Transfers
              </h2>
              <p className="text-lg text-foreground/80 leading-relaxed mb-10 max-w-2xl">
                Reliable, comfortable, and punctual airport transportation services
              </p>

              <ul className="space-y-4">
                {[
                  "No waiting times or delays",
                  "Real-time flight tracking included",
                  "Flat-rate upfront pricing",
                  "Professional uniformed drivers"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-foreground/90 font-medium text-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#84cc16]/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-[#84cc16]" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Element */}
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-video lg:aspect-[4/3] w-full rounded-[2rem] overflow-hidden bg-muted group shadow-2xl">
                <Image
                  src={AirportPickupImage}
                  alt="Professional Airport Transfer"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent"></div>

                {/* Decorative overlay element */}
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium mb-1">We track your flight</p>
                      <p className="text-white font-bold text-xl">Never wait, never worry.</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <Check className="w-6 h-6 text-accent-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
