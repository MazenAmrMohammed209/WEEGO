"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type UserRole = "user" | "admin";

interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, name: string, role?: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        await handleUser(session.user);
      }

      setIsLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (window.location.pathname.includes("reset-password")) return;

      if (event === "SIGNED_IN" && session?.user) {
        await handleUser(session.user);
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUser = async (supabaseUser: any) => {
    const email = supabaseUser.email || "";
    const name =
      supabaseUser.user_metadata?.full_name ||
      email.split("@")[0] ||
      "Traveler";

    try {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", supabaseUser.id)
        .single();

      setUser({
        email,
        name,
        role: data?.role || "user",
      });
    } catch {
      setUser({
        email,
        name,
        role: "user",
      });
    }
  };

  const login = (email: string, name: string, role: UserRole = "user") => {
    setUser({ email, name, role });
  };

  const logout = async () => {
    setUser(null);
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}