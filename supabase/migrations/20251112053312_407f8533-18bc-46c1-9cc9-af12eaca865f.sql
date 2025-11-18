-- Add additional columns for enhanced analysis
ALTER TABLE public.logo_detections
ADD COLUMN IF NOT EXISTS analysis_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- Add index for faster searches
CREATE INDEX IF NOT EXISTS idx_logo_detections_filename ON public.logo_detections(filename);
CREATE INDEX IF NOT EXISTS idx_logo_detections_created_at ON public.logo_detections(created_at DESC);

-- Add delete policy
CREATE POLICY "Anyone can delete detections"
  ON public.logo_detections
  FOR DELETE
  USING (true);