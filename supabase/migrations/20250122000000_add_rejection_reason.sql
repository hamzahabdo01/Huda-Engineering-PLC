-- Add rejection_reason field to property_bookings table
ALTER TABLE public.property_bookings 
ADD COLUMN rejection_reason TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.property_bookings.rejection_reason IS 'Reason provided when a booking is rejected';