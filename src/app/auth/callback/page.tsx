"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // AuthContext will automatically process the Supabase URL hash
    // and update `isAuthenticated` and `user`.
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        // If not authenticated (e.g. error redirect), go back to auth
        router.push("/auth");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-bg-light to-background dark:from-bg-dark dark:to-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <h2 className="text-xl font-medium text-foreground">Authenticating...</h2>
        <p className="text-sm text-foreground/60">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
