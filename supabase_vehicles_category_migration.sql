-- 1. ADD category_id COLUMN TO VEHICLES
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES vehicle_categories(id);

-- 2. MIGRATE EXISTING DATA FOR VEHICLES
UPDATE vehicles
SET category_id = vc.id
FROM vehicle_categories vc
WHERE vehicles.make = vc.name;

-- 3. ADD category_id TO BOOKINGS
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES vehicle_categories(id);

-- 4. ADD vehicle_id TO BOOKINGS (Optional mapping)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS vehicle_id uuid REFERENCES vehicles(id);
