/*
  # Update listings table schema for enhanced property management

  1. Schema Changes
    - Add `subcity` column for better location categorization
    - Add `bathrooms` column for bathroom count
    - Add `area_sqm` column for property area in square meters
    - Add `property_type` column for property categorization
    - Update existing constraints and indexes

  2. Property Types
    - Support for apartments, houses, offices, shops, etc.

  3. Indexes
    - Add indexes for new columns to improve query performance
*/

-- Add new columns to listings table
DO $$
BEGIN
  -- Add subcity column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'subcity'
  ) THEN
    ALTER TABLE listings ADD COLUMN subcity text;
  END IF;

  -- Add bathrooms column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'bathrooms'
  ) THEN
    ALTER TABLE listings ADD COLUMN bathrooms integer DEFAULT 1 CHECK (bathrooms >= 0);
  END IF;

  -- Add area_sqm column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'area_sqm'
  ) THEN
    ALTER TABLE listings ADD COLUMN area_sqm numeric CHECK (area_sqm > 0);
  END IF;

  -- Add property_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'property_type'
  ) THEN
    ALTER TABLE listings ADD COLUMN property_type text DEFAULT 'apartment';
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_listings_subcity ON listings(subcity);
CREATE INDEX IF NOT EXISTS idx_listings_bathrooms ON listings(bathrooms);
CREATE INDEX IF NOT EXISTS idx_listings_area_sqm ON listings(area_sqm);
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON listings(property_type);

-- Add constraint for property_type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'listings' AND constraint_name = 'listings_property_type_check'
  ) THEN
    ALTER TABLE listings ADD CONSTRAINT listings_property_type_check 
    CHECK (property_type IN ('apartment', 'house', 'villa', 'condominium', 'office', 'shop', 'warehouse', 'studio'));
  END IF;
END $$;