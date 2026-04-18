"use client";

import { useState, useEffect } from "react";
import { Trophy, Lock, CheckCircle2, Loader2, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";

interface RewardLevel {
  id: string;
  level_name: string;
  points_required: number;
  reward: string;
  reward_type: string;
  cost_on_wego: string;
  eligibility: string;
  color: string;
}

export default function RewardsPage() {
  const { t, lang } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [rawLevels, setRawLevels] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRewardsData() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: levelsData, error: levelsError } = await supabase
          .from("reward_levels")
          .select("*")
          .order("points_required", { ascending: true });

        if (levelsError) {
          console.error("Reward levels fetch error:", levelsError);
        }

        let pointsData = null;
        if (user?.email) {
          const { data, error } = await supabase
            .from("loyalty_points")
            .select("*")
            .eq("customer_email", user.email)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
            
          if (!error && data) {
            pointsData = data;
          }
        }

        const allLevels = levelsData || [];
        setRawLevels(allLevels);

        let userTotalPoints = 0;

        if (user?.email && pointsData) {
          userTotalPoints = pointsData.total_points || 0;
        }
        
        setPoints(userTotalPoints);
      } catch (err) {
        console.error("Error fetching rewards:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRewardsData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 bg-bg-light dark:bg-bg-dark min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isArabic = lang === "ar";
  const levels: RewardLevel[] = rawLevels.map((level) => ({
    id: level.id,
    color: level.color,
    level_name: isArabic ? level.level_name : (level.level_name_en || level.level_name),
    points_required: level.points_required,
    reward: isArabic ? level.reward : (level.reward_en || level.reward),
    reward_type: isArabic ? level.reward_type : (level.reward_type_en || level.reward_type),
    cost_on_wego: isArabic ? level.cost_on_wego : (level.cost_on_wego_en || level.cost_on_wego),
    eligibility: isArabic ? level.eligibility : (level.eligibility_en || level.eligibility),
  }));

  // Calculate current and next level
  const cLevel = [...levels].reverse().find(l => points >= l.points_required) || levels[0];
  const cIndex = levels.findIndex(l => l.id === cLevel?.id);
  const nextLevel = cIndex >= 0 && cIndex < levels.length - 1 ? levels[cIndex + 1] : null;
  
  const currentThemeColor = cLevel?.color || "#cd7f32";

  let progressPercent = 100;
  let pointsAway = 0;
  
  if (nextLevel && cLevel) {
    const range = nextLevel.points_required - cLevel.points_required;
    const progress = points - cLevel.points_required;
    progressPercent = Math.min(100, Math.max(0, (progress / range) * 100));
    pointsAway = nextLevel.points_required - points;
  }

  return (
    <div className="py-24 bg-bg-light dark:bg-bg-dark min-h-screen">
      <div className="container-base">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 mt-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary dark:text-primary-foreground sm:text-5xl mb-4">
              My Rewards
            </h1>
            <p className="text-lg text-foreground/70">
              Earn points on every trip and unlock exclusive tiers with massive discounts and free rides!
            </p>
          </div>
          <div className="mt-8 md:mt-0">
            <Link
              href="/booking"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-sm transition-transform hover:scale-105"
            >
              Book to Earn
            </Link>
          </div>
        </div>

        {/* Current Tier Premium Card */}
        <div className="mb-16 animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-150">
          <div 
            className="w-full rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden flex flex-col justify-center transition-all duration-700 shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${currentThemeColor}cc 0%, ${currentThemeColor} 100%)`,
              boxShadow: `0 0 40px ${currentThemeColor}40`
            }}
          >
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
            <div className="absolute top-0 right-0 h-96 w-96 bg-white/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 animate-pulse duration-3000" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-inner border border-white/20">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white/80 uppercase tracking-widest block mb-1">Current Tier</span>
                  <span className="text-4xl font-black text-white drop-shadow-md">{cLevel?.level_name || "Bronze"}</span>
                </div>
              </div>
              
              <div className="md:text-right bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <span className="text-sm font-bold text-white/80 uppercase tracking-widest block mb-1">Total Points</span>
                <span className="text-4xl font-black text-white">{points.toLocaleString()}</span>
              </div>
            </div>

            {/* Main Reward Highlight */}
            {cLevel?.reward && (
               <div className="relative z-10 mb-10 inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 shadow-lg">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span className="font-bold text-lg">{cLevel.reward}</span>
               </div>
            )}

            {/* Progress Bar Section */}
            <div className="relative z-10 w-full max-w-3xl">
              <div className="flex justify-between items-end mb-3">
                <span className="text-sm font-bold text-white/90 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                  {nextLevel ? `You are ${pointsAway.toLocaleString()} points away from ${nextLevel.level_name}` : "Maximum Level Reached!"}
                </span>
                <span className="text-sm font-black tracking-wider">
                  {nextLevel ? `${points.toLocaleString()} / ${nextLevel.points_required.toLocaleString()}` : ""}
                </span>
              </div>
              <div className="h-4 w-full bg-black/30 rounded-full overflow-hidden border border-white/20 shadow-inner">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out relative" 
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/50 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-primary dark:text-primary-foreground mb-10 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300">Reward Tiers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((lvl, idx) => {
              const isUnlocked = points >= lvl.points_required;
              const isCurrent = cLevel?.id === lvl.id;
              
              const delay = 300 + (idx * 150);
              
              return (
                <div 
                  key={lvl.id}
                  className={`relative p-6 rounded-3xl border transition-all duration-500 flex flex-col ${
                    isCurrent 
                      ? 'border-2 shadow-[0_0_30px_rgba(0,0,0,0.15)] scale-[1.05] bg-background z-10' 
                      : isUnlocked 
                        ? 'border-border bg-background shadow-md hover:shadow-xl hover:scale-105 hover:border-primary/50' 
                        : 'border-border/50 bg-background/50 opacity-60 backdrop-blur-sm grayscale-[0.3]'
                  } animate-in slide-in-from-bottom-12 fade-in`}
                  style={{ 
                    borderColor: isCurrent ? lvl.color : undefined,
                    boxShadow: isCurrent ? `0 0 30px ${lvl.color}30` : undefined,
                    animationDelay: `${delay}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {isCurrent && (
                    <div 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-background text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg z-10 whitespace-nowrap animate-pulse"
                      style={{ backgroundColor: lvl.color }}
                    >
                      Current Tier
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className="h-14 w-14 rounded-2xl flex items-center justify-center border shadow-inner"
                      style={{ 
                        backgroundColor: `${lvl.color}15`, 
                        borderColor: `${lvl.color}40`,
                        color: lvl.color 
                      }}
                    >
                      {isUnlocked ? <CheckCircle2 className="h-7 w-7" /> : <Lock className="h-7 w-7 opacity-70" />}
                    </div>
                    <div className="text-right bg-foreground/[0.03] px-3 py-1.5 rounded-lg">
                      <span className="text-xs font-black text-foreground/60 uppercase tracking-wider block">{lvl.points_required.toLocaleString()} pts</span>
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-black mb-4" style={{ color: isUnlocked ? lvl.color : undefined }}>{lvl.level_name}</h4>
                  
                  {/* BIG Highlight Text for Reward */}
                  {lvl.reward && (
                    <div className="mb-6 p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.05]">
                      <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider block mb-1">Reward</span>
                      <span className="text-xl font-bold leading-tight text-foreground">{lvl.reward}</span>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-3 mt-auto pt-4 border-t border-border/50">
                    {lvl.reward_type && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-foreground/60">Type</span>
                        <span className="font-semibold text-foreground bg-foreground/[0.04] px-2 py-1 rounded-md">{lvl.reward_type}</span>
                      </div>
                    )}
                    {lvl.cost_on_wego && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-foreground/60">Cost</span>
                        <span className="font-semibold text-foreground bg-foreground/[0.04] px-2 py-1 rounded-md">{lvl.cost_on_wego}</span>
                      </div>
                    )}
                    {lvl.eligibility && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-foreground/60">Eligibility</span>
                        <span className="font-semibold text-foreground bg-foreground/[0.04] px-2 py-1 rounded-md">{lvl.eligibility}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
