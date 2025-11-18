-- Create storage bucket for logo images
INSERT INTO storage.buckets (id, name, public)
VALUES ('logo-images', 'logo-images', true);

-- Create logo_detections table
CREATE TABLE public.logo_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  image_url TEXT NOT NULL,
  detections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.logo_detections ENABLE ROW LEVEL SECURITY;

-- Allow public read access to detections
CREATE POLICY "Anyone can view detections"
  ON public.logo_detections
  FOR SELECT
  USING (true);

-- Allow public insert (since no auth required)
CREATE POLICY "Anyone can create detections"
  ON public.logo_detections
  FOR INSERT
  WITH CHECK (true);

-- Storage policies for logo images
CREATE POLICY "Public can upload logo images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'logo-images');

CREATE POLICY "Public can view logo images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'logo-images');