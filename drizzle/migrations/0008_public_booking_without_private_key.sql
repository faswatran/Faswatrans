CREATE OR REPLACE FUNCTION public.submit_booking(p_booking jsonb)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ref text := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
DECLARE photo text := nullif(p_booking->>'item_photo', '');
BEGIN
  IF coalesce(p_booking->>'service','') NOT IN ('Staff booking','Event hiring','Private charter','Delivery')
    OR length(trim(coalesce(p_booking->>'full_name',''))) NOT BETWEEN 2 AND 120
    OR length(coalesce(p_booking->>'email','')) NOT BETWEEN 3 AND 200
    OR coalesce(p_booking->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    OR length(coalesce(p_booking->>'phone','')) NOT BETWEEN 7 AND 20
    OR length(trim(coalesce(p_booking->>'origin',''))) NOT BETWEEN 2 AND 60
    OR length(trim(coalesce(p_booking->>'destination',''))) NOT BETWEEN 2 AND 60
    OR coalesce(p_booking->>'travel_date','') !~ '^\d{4}-\d{2}-\d{2}$'
    OR coalesce((p_booking->>'passengers')::integer,0) NOT BETWEEN 1 AND 60
    OR length(coalesce(p_booking->>'notes','')) NOT BETWEEN 1 AND 500
  THEN RAISE EXCEPTION 'Please check your booking details.'; END IF;
  IF p_booking->>'service' = 'Delivery' AND photo IS NULL THEN
    RAISE EXCEPTION 'Add a photo of the item.';
  END IF;
  IF photo IS NOT NULL AND (photo !~ '^[a-f0-9-]{36}\.(jpeg|png|webp)$' OR NOT EXISTS (
    SELECT 1 FROM storage.objects WHERE bucket_id = 'delivery-photos' AND name = photo
  )) THEN RAISE EXCEPTION 'Please upload the item photo again.'; END IF;
  INSERT INTO public.bookings(reference, service, full_name, email, phone, origin, destination, travel_date, passengers, notes, item_photo)
  VALUES(ref, p_booking->>'service', trim(p_booking->>'full_name'), p_booking->>'email', p_booking->>'phone', p_booking->>'origin', p_booking->>'destination', (p_booking->>'travel_date')::date, (p_booking->>'passengers')::integer, p_booking->>'notes', photo);
  RETURN ref;
END $$;
REVOKE ALL ON FUNCTION public.submit_booking(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_booking(jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.lookup_booking(p_code text)
RETURNS TABLE(reference text, service text, status text, travel_date date, created_at timestamptz, approved_at timestamptz, completed_at timestamptz, tracking jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.reference, b.service, b.status, b.travel_date, b.created_at, b.approved_at, b.completed_at, b.tracking
  FROM public.bookings b WHERE b.reference = upper(trim(ltrim(trim(p_code), '#')))
  AND length(p_code) BETWEEN 4 AND 13 LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.lookup_booking(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_booking(text) TO anon, authenticated;

CREATE POLICY "Customers upload item photos" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'delivery-photos' AND name ~ '^[a-f0-9-]{36}\.(jpeg|png|webp)$' AND (metadata->>'mimetype') IN ('image/jpeg','image/png','image/webp'));
CREATE POLICY "Published news photo reads" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'news-photos' AND EXISTS (SELECT 1 FROM public.news_posts n WHERE n.photo_url = '/api/public/news-photo/' || name));