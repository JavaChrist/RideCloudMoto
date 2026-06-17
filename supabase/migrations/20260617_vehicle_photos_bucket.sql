-- ════════════════════════════════════════════════════════════════════════════
-- RideCloudMoto — Bucket public pour les photos de véhicules
-- À appliquer si schema.sql a été posé avant l'ajout des photos.
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-photos', 'vehicle-photos', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vehicle_photos_public_read') THEN
    CREATE POLICY vehicle_photos_public_read ON storage.objects FOR SELECT
      USING (bucket_id = 'vehicle-photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vehicle_photos_insert_own') THEN
    CREATE POLICY vehicle_photos_insert_own ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vehicle_photos_update_own') THEN
    CREATE POLICY vehicle_photos_update_own ON storage.objects FOR UPDATE
      USING (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vehicle_photos_delete_own') THEN
    CREATE POLICY vehicle_photos_delete_own ON storage.objects FOR DELETE
      USING (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;
