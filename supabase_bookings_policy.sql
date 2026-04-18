-- 1. DATABASE CHECK
-- Ensure bookings.status column exists (It likely already does if you've been working with it, but this acts as a safe fallback check).
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 2. RLS POLICY
-- Allow admins to update the table directly.
CREATE POLICY "Admins can update bookings" 
ON public.bookings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
