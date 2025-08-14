/*
  # Add rejection reason column to property bookings

  1. Schema Changes
    - Add `rejection_reason` column to `property_bookings` table
    - This will store the reason when a booking is rejected
    - Column is optional (nullable) since it's only used for rejections

  2. Purpose
    - Allows admin to provide specific reasons for booking rejections
    - This reason will be included in the rejection email sent to customers
    - Improves customer communication and transparency
*/

-- Add rejection_reason column to property_bookings table
ALTER TABLE public.property_bookings 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN public.property_bookings.rejection_reason IS 'Reason provided by admin when rejecting a booking request';

-- Update the updated_at trigger if it exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column if it doesn't exist
ALTER TABLE public.property_bookings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_property_bookings_updated_at ON public.property_bookings;
CREATE TRIGGER update_property_bookings_updated_at
  BEFORE UPDATE ON public.property_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();