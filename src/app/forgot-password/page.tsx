"use client";

import { useState } from "react";
import { Mail, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || cooldown > 0) return;

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const resetUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/reset-password` : "http://localhost:3000/reset-password";
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });

      if (error) {
        throw error;
      }

      setMessage("If an account exists, a password reset link has been sent to your email.");
      setCooldown(60);
      
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);

    } catch (err: any) {
      if (err.status === 429) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Failed to send reset instructions.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-bg-light to-background dark:from-bg-dark dark:to-background">
      <div className="w-full max-w-md space-y-8 rounded-[2rem] bg-background/60 backdrop-blur-xl p-10 border border-border shadow-2xl relative overflow-hidden">
        
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <Link href="/" className="inline-flex mb-6 text-primary dark:text-primary-foreground font-bold text-2xl tracking-tighter">
              W<span className="italic text-accent">E</span>EGO
            </Link>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary dark:text-primary-foreground">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-foreground/70 mb-2">
              Enter your email and we'll send you instructions to reset your password.
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {message && (
            <div className="w-full rounded-xl bg-green-500/10 p-4 border border-green-500/20 animate-in fade-in zoom-in duration-300">
              <div className="text-sm text-green-600 dark:text-green-400 font-bold text-center">{message}</div>
            </div>
          )}
          {error && (
            <div className="w-full rounded-xl bg-red-500/10 p-4 border border-red-500/20 animate-in fade-in zoom-in duration-300">
              <div className="text-sm text-red-600 dark:text-red-400 font-medium text-center">{error}</div>
            </div>
          )}

          <div className="w-full space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                <Mail className="h-5 w-5 text-muted-foreground opacity-50" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-2xl border-0 py-3.5 ps-12 pe-4 text-foreground ring-1 ring-inset ring-border placeholder:text-foreground/50 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 bg-background/50 backdrop-blur-sm transition-all shadow-sm"
                placeholder="Email Address"
              />
            </div>
          </div>

          <div className="w-full mt-4 space-y-3">
            <button
              type="submit"
              disabled={isLoading || cooldown > 0 || !email}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-4 text-base font-semibold text-accent-foreground shadow-lg hover:bg-accent/90 hover:scale-[1.03] hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-70 transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : cooldown > 0 ? (
                <span>Wait {cooldown}s</span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1.5 transition-transform rtl:rotate-180" />
                </>
              )}
            </button>

            <Link
              href="/auth"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-transparent px-4 py-4 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
