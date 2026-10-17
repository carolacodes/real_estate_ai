-- STEP 1: Run manually before deploying code that reads image_urls.
-- Preserves existing non-empty image_urls on a repeated run.
BEGIN;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}';

UPDATE public.properties SET image_urls = '{}' WHERE image_urls IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'properties'
      AND column_name = 'image_url'
  ) THEN
    UPDATE public.properties
    SET image_urls = ARRAY[image_url]
    WHERE cardinality(image_urls) = 0
      AND image_url IS NOT NULL AND btrim(image_url) <> '';
  END IF;
END $$;

ALTER TABLE public.properties
  ALTER COLUMN image_urls SET DEFAULT '{}',
  ALTER COLUMN image_urls SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.properties'::regclass
      AND conname = 'properties_image_urls_max_four'
  ) THEN
    ALTER TABLE public.properties
      ADD CONSTRAINT properties_image_urls_max_four
      CHECK (cardinality(image_urls) <= 4);
  END IF;
END $$;

COMMIT;
-- Keep image_url until the updated application is deployed.
