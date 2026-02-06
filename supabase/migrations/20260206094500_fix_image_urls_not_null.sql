BEGIN;
ALTER TABLE public.cars ALTER COLUMN image_urls SET DEFAULT ARRAY[]::text[];
UPDATE public.cars SET image_urls = ARRAY[image_url] WHERE image_urls IS NULL AND image_url IS NOT NULL;
UPDATE public.cars SET image_urls = ARRAY[]::text[] WHERE image_urls IS NULL;
ALTER TABLE public.cars ALTER COLUMN image_urls SET NOT NULL;
COMMIT;
