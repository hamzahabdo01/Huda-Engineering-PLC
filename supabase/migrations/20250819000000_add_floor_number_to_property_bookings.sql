-- Add floor_number to property_bookings to capture selected floor from floor plans
ALTER TABLE public.property_bookings 
ADD COLUMN IF NOT EXISTS floor_number INTEGER;

COMMENT ON COLUMN public.property_bookings.floor_number IS 'Selected floor number when booking from floor plans';

