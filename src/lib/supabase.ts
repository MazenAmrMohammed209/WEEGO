import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
  throw new Error("Missing or invalid NEXT_PUBLIC_SUPABASE_URL environment variable.");
}

if (!supabaseAnonKey || supabaseAnonKey.includes("placeholder")) {
  throw new Error("Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options) => fetch(url, { ...options, cache: "no-store" })
  }
});
