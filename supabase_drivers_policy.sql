-- Enable Row Level Security on the drivers table
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for all users (or restrict to authenticated based on your security rules)
CREATE POLICY "Allow SELECT on drivers" 
ON public.drivers 
FOR SELECT 
USING (true);

-- Allow INSERT for authenticated users
CREATE POLICY "Allow INSERT on drivers" 
ON public.drivers 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Optional: Allow UPDATE for authenticated users if drivers need to update their status
CREATE POLICY "Allow UPDATE on drivers" 
ON public.drivers 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);
