-- Add missing fields to property_bookings table
ALTER TABLE public.property_bookings 
ADD COLUMN IF NOT EXISTS unit_type TEXT,
ADD COLUMN IF NOT EXISTS preferred_contact TEXT DEFAULT 'WhatsApp',
ADD COLUMN IF NOT EXISTS secondary_phone TEXT,
ADD COLUMN IF NOT EXISTS recaptcha_token TEXT;

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_contact TEXT DEFAULT 'WhatsApp',
  secondary_phone TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  recaptcha_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for appointments
CREATE POLICY "Anyone can submit appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update appointments" ON public.appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete appointments" ON public.appointments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create projects units and Amenities columns if they don't exist
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS units JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "Amenities" TEXT[] DEFAULT '{}';

-- Create unit_stock table for tracking unit availability
CREATE TABLE IF NOT EXISTS public.unit_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  unit_type TEXT NOT NULL,
  total_units INTEGER NOT NULL DEFAULT 0,
  booked_units INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, unit_type)
);

-- Enable RLS for unit_stock table
ALTER TABLE public.unit_stock ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for unit_stock
CREATE POLICY "Anyone can view unit stock" ON public.unit_stock
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage unit stock" ON public.unit_stock
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for unit_stock timestamp updates
CREATE TRIGGER update_unit_stock_updated_at
  BEFORE UPDATE ON public.unit_stock
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment booked units
CREATE OR REPLACE FUNCTION public.increment_booked_units(property_id UUID, unit_type TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.unit_stock 
  SET booked_units = booked_units + 1,
      updated_at = now()
  WHERE unit_stock.property_id = increment_booked_units.property_id 
    AND unit_stock.unit_type = increment_booked_units.unit_type;
  
  -- If no row was updated, insert a new one
  IF NOT FOUND THEN
    INSERT INTO public.unit_stock (property_id, unit_type, total_units, booked_units)
    VALUES (increment_booked_units.property_id, increment_booked_units.unit_type, 0, 1);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;