"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { Mail, Lock, User, KeyRound, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });
import 'react-phone-input-2/lib/style.css';
import { useTheme } from "next-themes";

function AuthForm() {
  const searchParams = useSearchParams();
  const initialVariant = searchParams.get("variant") === "register" ? false : true;

  const [isLogin, setIsLogin] = useState(initialVariant);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // STRICT REQUEST LOCK
  const requestLock = useRef(false);

  const { login, isAuthenticated, user: authUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const variant = searchParams.get("variant");
    setIsLogin(variant === "register" ? false : true);
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      router.push("/");
    }
  }, [isAuthenticated, authUser, router]);

  // Reset error when switching modes
  useEffect(() => {
    setError("");
    setSuccessMessage("");
  }, [isLogin]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // STRICT LOCK PREVENTION
    if (requestLock.current || isLoading || cooldown > 0) {
      console.log("Request blocked by lock or cooldown");
      return;
    }
    
    console.log("SUBMIT FIRED");
    
    requestLock.current = true;
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string || "Traveler";

    // 1. Validation Logic
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("auth.validation.invalidEmail") || "Invalid email format");
      setIsLoading(false);
      requestLock.current = false;
      return;
    }

    if (password.length < 6) {
      setError(t("auth.validation.passwordShort") || "Password too short");
      setIsLoading(false);
      requestLock.current = false;
      return;
    }

    if (!isLogin) {
      if (!phone || phone.length < 8) {
        setError("Please enter a valid phone number.");
        setIsLoading(false);
        requestLock.current = false;
        return;
      }
      const confirmPassword = formData.get("confirmPassword") as string;
      if (password !== confirmPassword) {
        setError(t("auth.validation.passwordMatch") || "Passwords do not match");
        setIsLoading(false);
        requestLock.current = false;
        return;
      }
    }

    // 2. Auth Execution Logic
    try {
      if (isLogin) {
        // Supabase Login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        // Wait for session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          throw new Error("Failed to establish session.");
        }

        // Fetch role
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const role = userData?.role || 'user';
        login(email, name, role);

        router.refresh();
        router.push('/');
      } else {
        console.log({
          email,
          fullName: name,
          phone
        });

        // Supabase Signup
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        const user = data.user;

        if (!user) {
          throw new Error("User not created. Please try again.");
        }

        // Wait for session
        await supabase.auth.getSession();

        setSuccessMessage("Account created successfully! Please log in.");
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error("Auth error:", err.message);
      
      // 3. Strict Rate Limit & Error Segregation
      if (err.status === 429) {
        setCooldown(60);
        setError("Too many attempts. Please wait 60 seconds.");
      } else if (err.message?.includes("Invalid login credentials") || err.message?.includes("Invalid credentials")) {
        setError("Invalid email or password.");
      } else if (err.message?.includes("User not found")) {
        setError("User not found.");
      } else if (err.message?.includes("already registered")) {
        setError("User already exists. Please log in.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
      requestLock.current = false;
    }
  };

  return (
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
            {isLogin ? t("auth.login.title") : t("auth.register.title")}
          </h2>
          <p className="mt-2 text-sm text-foreground/70 mb-2">
            {isLogin ? t("auth.login.subtitle") : t("auth.register.subtitle")}
          </p>
          <p className="mt-2 text-sm text-foreground/70">
            {isLogin ? t("auth.login.noAccount") + " " : t("auth.register.haveAccount") + " "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-accent hover:text-accent/80 focus:outline-none focus:underline transition-colors rtl:ms-1"
            >
              {isLogin ? t("auth.login.createAccount") : t("auth.register.login")}
            </button>
          </p>
        </div>
      </div>

      <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
        {successMessage && (
          <div className="w-full rounded-xl bg-green-500/10 p-4 border border-green-500/20 animate-in fade-in zoom-in duration-300">
            <div className="text-sm text-green-600 dark:text-green-400 font-bold text-center">{successMessage}</div>
          </div>
        )}
        {error && (
          <div className="w-full rounded-xl bg-red-500/10 p-4 border border-red-500/20 animate-in fade-in zoom-in duration-300">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium text-center">{error}</div>
          </div>
        )}

        <div className="w-full space-y-4">
          {!isLogin && (
            <div className="relative animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                <User className="h-5 w-5 text-muted-foreground opacity-50" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required={!isLogin}
                className="block w-full rounded-2xl border-0 py-3.5 ps-12 pe-4 text-foreground ring-1 ring-inset ring-border placeholder:text-foreground/50 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 bg-background/50 backdrop-blur-sm transition-all shadow-sm"
                placeholder={t("auth.placeholders.name")}
              />
            </div>
          )}

          {!isLogin && (
            <div className="relative animate-in slide-in-from-top-2 fade-in duration-300" dir="ltr" style={{ position: "relative", zIndex: 10 }}>
              <style jsx global>{`
                  .phone-container {
                    width: 100%;
                  }

                  .phone-input-field {
                    width: 100% !important;
                    height: 50px !important;
                    border-radius: 12px !important;
                    background: transparent !important;
                    border: 1px solid #2a2a2a !important;
                    color: white !important;
                    padding-left: 60px !important;
                  }

                  .phone-dropdown-button {
                    border-radius: 12px 0 0 12px !important;
                    background: transparent !important;
                    border: none !important;
                  }

                  .phone-dropdown {
                    background: #0f172a !important;
                    color: white !important;
                    max-height: 250px !important;
                    overflow-y: auto !important;
                    z-index: 9999 !important;
                    border-radius: 10px !important;
                  }

                  /* fix dropdown full width + z-index */
                  .react-tel-input .country-list {
                    width: 250px !important;
                    max-height: 250px !important;
                    overflow-y: auto !important;
                    z-index: 9999 !important;
                    border-radius: 10px !important;
                  }

                  /* improve select look */
                  .react-tel-input .selected-flag {
                    background: transparent !important;
                  }
                  .react-tel-input .selected-flag:hover {
                    background: rgba(255,255,255,0.05) !important;
                  }

                  /* Static Dark Mode Styling */
                  .phone-fixed .react-tel-input .form-control {
                    background: transparent !important;
                    color: white !important;
                    border: 1px solid #2a2a2a !important;
                  }
                  .phone-fixed .react-tel-input .flag-dropdown {
                    background: transparent !important;
                    border: none !important;
                  }
                  .phone-fixed .react-tel-input .country-list {
                    background: #020617 !important;
                    color: white !important;
                    border: 1px solid #1e293b !important;
                  }
                  .phone-fixed .react-tel-input .country {
                    background: transparent !important;
                    color: white !important;
                  }
                  .phone-fixed .react-tel-input .country.highlight {
                    background: #1e293b !important;
                  }
                  .phone-fixed .react-tel-input .country:hover {
                    background: #1e293b !important;
                  }
                  .phone-fixed .react-tel-input .search {
                    background-color: #020617 !important;
                    padding: 8px !important;
                  }
                  .phone-fixed .react-tel-input .search-box {
                    background: #020617 !important;
                    color: white !important;
                    border: 1px solid #334155 !important;
                    width: 100% !important;
                    outline: none !important;
                  }
                  .phone-fixed .react-tel-input .search-box::placeholder {
                    color: #94a3b8 !important;
                  }
                  .react-tel-input * {
                    box-shadow: none !important;
                  }
                `}</style>
              <div className="phone-fixed">
                <div className="phone-input-wrapper block w-full rounded-2xl ring-0 focus-within:ring-2 focus-within:ring-accent transition-all shadow-sm">
                  <PhoneInput
                    country={'eg'}
                    enableSearch={true}
                    value={phone}
                    onChange={(value) => setPhone(value)}
                    excludeCountries={['il']}
                    inputClass="phone-input-field"
                    buttonClass="phone-dropdown-button"
                    dropdownClass="phone-dropdown"
                    containerClass="phone-container"
                    inputProps={{
                      name: 'phone',
                      required: !isLogin,
                      autoFocus: false
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground opacity-50" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-2xl border-0 py-3.5 ps-12 pe-4 text-foreground ring-1 ring-inset ring-border placeholder:text-foreground/50 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 bg-background/50 backdrop-blur-sm transition-all shadow-sm"
              placeholder={t("auth.placeholders.email")}
            />
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground opacity-50" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="block w-full rounded-2xl border-0 py-3.5 ps-12 pe-4 text-foreground ring-1 ring-inset ring-border placeholder:text-foreground/50 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 bg-background/50 backdrop-blur-sm transition-all shadow-sm"
                placeholder={t("auth.placeholders.password")}
              />
            </div>
            {isLogin && (
              <div className="flex justify-end mt-2 px-2">
                <Link href="/forgot-password" className="text-xs font-semibold text-accent hover:text-accent/80 hover:underline transition-all">
                  {t("auth.login.forgotPassword") || "Forgot Password?"}
                </Link>
              </div>
            )}
          </div>


          {!isLogin && (
            <div className="relative animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                <KeyRound className="h-5 w-5 text-muted-foreground opacity-50" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required={!isLogin}
                className="block w-full rounded-2xl border-0 py-3.5 ps-12 pe-4 text-foreground ring-1 ring-inset ring-border placeholder:text-foreground/50 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 bg-background/50 backdrop-blur-sm transition-all shadow-sm"
                placeholder={t("auth.placeholders.confirmPassword")}
              />
            </div>
          )}
        </div>



        <div className="w-full mt-4">
          <button
            type="submit"
            disabled={isLoading || cooldown > 0}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-4 text-base font-semibold text-accent-foreground shadow-lg hover:bg-accent/90 hover:scale-[1.03] hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-70 transition-all duration-300"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : cooldown > 0 ? (
              <span>Wait {cooldown}s</span>
            ) : (
              <>
                <span>{isLogin ? t("auth.login.button") : t("auth.register.button")}</span>
                <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1.5 transition-transform rtl:rotate-180" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-bg-light to-background dark:from-bg-dark dark:to-background">
      <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
