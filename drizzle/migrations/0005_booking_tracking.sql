ALTER TABLE public.bookings ADD COLUMN tracking jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.bookings ADD COLUMN completed_at timestamptz;