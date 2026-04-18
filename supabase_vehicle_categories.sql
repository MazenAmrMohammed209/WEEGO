CREATE TABLE IF NOT EXISTS vehicle_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  capacity integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Note: Ensure that anon can read
ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on vehicle_categories"
  ON vehicle_categories FOR SELECT
  USING (true);

INSERT INTO vehicle_categories (name, slug, capacity) VALUES
  ('Sedan', 'sedan', 4),
  ('SUV 4', 'suv-4', 4),
  ('SUV 7', 'suv-7', 7),
  ('H1', 'h1', 19),
  ('High S', 'high-s', 14),
  ('Coaster', 'coaster', 33),
  ('Bus', 'bus', 50)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name, 
  capacity = EXCLUDED.capacity;
