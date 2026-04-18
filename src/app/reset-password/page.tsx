"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔥 INIT SESSION FROM EMAIL LINK (PKCE ONLY)
  useEffect(() => {
    const init = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (!code) {
          setError("Invalid or expired reset link");
          setReady(true);
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);



        setReady(true);
      } catch (err) {
        console.error(err);
        setError("Something went wrong");
        setReady(true);
      }
    };

    init();
  }, []);

  // 🔥 HANDLE PASSWORD UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Password updated successfully");

    await supabase.auth.signOut();

    window.location.href = "/auth";
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Verifying reset link...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-6 border rounded-xl">

        <h2 className="text-xl font-bold mb-4">Reset Password</h2>

        {error && (
          <div className="text-red-500 mb-3">{error}</div>
        )}

        {success && (
          <div className="text-green-500 mb-3">{success}</div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 mb-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white p-2"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <button
          onClick={() => (window.location.href = "/auth")}
          className="mt-4 text-sm underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}