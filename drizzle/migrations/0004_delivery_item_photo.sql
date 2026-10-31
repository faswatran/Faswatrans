ALTER TABLE public.bookings ADD COLUMN item_photo text;
CREATE POLICY "Admins view delivery photos" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'delivery-photos' AND public.has_role(auth.uid(), 'admin'));