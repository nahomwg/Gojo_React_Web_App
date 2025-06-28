/*
  # Update listings table for property type distinction

  1. Schema Changes
    - Add `type` field (enum: 'residential', 'business')
    - Add `square_meters` (integer, optional for residential)
    - Add `business_features` (array of text, optional for residential)
    - Update constraints based on property type

  2. Validation Rules
    - If type is 'residential': bedrooms is required
    - If type is 'business': square_meters is required

  3. Data Migration
    - Set existing properties to appropriate types based on property_type
*/

-- Add new columns to listings table
DO $$
BEGIN
  -- Add type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'type'
  ) THEN
    ALTER TABLE listings ADD COLUMN type text DEFAULT 'residential' CHECK (type IN ('residential', 'business'));
  END IF;

  -- Add square_meters column (for business properties)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'square_meters'
  ) THEN
    ALTER TABLE listings ADD COLUMN square_meters integer CHECK (square_meters > 0);
  END IF;

  -- Add business_features column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'business_features'
  ) THEN
    ALTER TABLE listings ADD COLUMN business_features text[] DEFAULT '{}';
  END IF;
END $$;

-- Update existing data based on property_type
UPDATE listings 
SET type = 'business' 
WHERE property_type IN ('office', 'shop', 'warehouse');

UPDATE listings 
SET type = 'residential' 
WHERE property_type IN ('apartment', 'house', 'villa', 'condominium', 'studio');

-- Copy area_sqm to square_meters for business properties
UPDATE listings 
SET square_meters = CAST(area_sqm AS integer)
WHERE type = 'business' AND area_sqm IS NOT NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_square_meters ON listings(square_meters);

-- Add validation function for type-specific requirements
CREATE OR REPLACE FUNCTION validate_listing_requirements()
RETURNS TRIGGER AS $$
BEGIN
  -- For residential properties, bedrooms is required
  IF NEW.type = 'residential' AND (NEW.bedrooms IS NULL OR NEW.bedrooms < 0) THEN
    RAISE EXCEPTION 'Bedrooms is required for residential properties';
  END IF;
  
  -- For business properties, square_meters is required
  IF NEW.type = 'business' AND (NEW.square_meters IS NULL OR NEW.square_meters <= 0) THEN
    RAISE EXCEPTION 'Square meters is required for business properties';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_listing_requirements_trigger ON listings;
CREATE TRIGGER validate_listing_requirements_trigger
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION validate_listing_requirements();