-- 3. FIX RLS POLICY
-- Run in SQL:
CREATE POLICY "Allow user insert"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);
