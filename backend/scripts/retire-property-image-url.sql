-- STEP 2: Run manually ONLY after Step 1 and deployment of image_urls code.
-- No CASCADE: PostgreSQL will reject removal if dependent objects still exist.
BEGIN;

LOCK TABLE public.properties IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'properties'
      AND column_name = 'image_url'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM public.properties
      WHERE image_url IS NOT NULL AND btrim(image_url) <> ''
        AND array_position(image_urls, image_url) IS NULL
    ) THEN
      RAISE EXCEPTION 'Cannot drop image_url: some existing URLs have not been preserved in image_urls';
    END IF;
  END IF;
END $$;

ALTER TABLE public.properties DROP COLUMN IF EXISTS image_url;

COMMIT;
