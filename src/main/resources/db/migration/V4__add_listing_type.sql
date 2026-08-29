-- Add listing_type column to distinguish FOR_SALE from FOR_RENT properties
ALTER TABLE properties ADD COLUMN listing_type VARCHAR(20) NOT NULL DEFAULT 'FOR_SALE';

-- Set rent properties with monthly rent amounts
-- Lotus Residency 2BHK, Happy Homes 1BHK, Corner Shop Retail are for rent
UPDATE properties SET listing_type = 'FOR_RENT', monthly_rent = 25000
  WHERE title = 'Lotus Residency 2BHK' AND monthly_rent IS NULL;
UPDATE properties SET listing_type = 'FOR_RENT', monthly_rent = 12000
  WHERE title = 'Happy Homes 1BHK' AND monthly_rent IS NULL;
UPDATE properties SET listing_type = 'FOR_RENT', monthly_rent = 35000
  WHERE title = 'Corner Shop Retail' AND monthly_rent IS NULL;

-- Back-fill any remaining properties with monthly_rent set
UPDATE properties SET listing_type = 'FOR_RENT' WHERE monthly_rent IS NOT NULL AND monthly_rent > 0 AND listing_type = 'FOR_SALE';
