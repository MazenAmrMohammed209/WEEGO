-- Supabase RLS Policy Fix for airport_requests table
-- Allow public insert to airport_requests to ensure guest users and regular users can both submit successfully.

-- 1. Enable RLS if not already enabled
ALTER TABLE public.airport_requests ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing insert policy if it exists to avoid conflicts (optional but recommended for clean slate)
DROP POLICY IF EXISTS "Allow public insert" ON public.airport_requests;

-- 3. Create the new policy
CREATE POLICY "Allow public insert"
ON public.airport_requests
FOR INSERT
TO public
WITH CHECK (true);
