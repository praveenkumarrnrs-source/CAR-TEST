BEGIN;

UPDATE public.cars
SET image_url = NULL,
    image_urls = ARRAY[]::text[],
    updated_at = now()
WHERE image_url IS NOT NULL
  AND NOT (
    lower(replace(image_url, ' ', '')) LIKE '%' || replace(lower(brand), ' ', '') || '%'
    AND lower(replace(image_url, ' ', '')) LIKE '%' || replace(lower(model), ' ', '') || '%'
  );

UPDATE public.cars
SET image_urls = ARRAY(
  SELECT url
  FROM unnest(image_urls) AS url
  WHERE lower(replace(url, ' ', '')) LIKE '%' || replace(lower(brand), ' ', '') || '%'
    AND lower(replace(url, ' ', '')) LIKE '%' || replace(lower(model), ' ', '') || '%'
)
WHERE image_urls IS NOT NULL;

UPDATE public.cars
SET image_url = NULL
WHERE image_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.cars c2
    WHERE c2.id <> public.cars.id
      AND c2.image_url = public.cars.image_url
      AND lower(c2.brand) = lower(public.cars.brand)
      AND lower(c2.model) = lower(public.cars.model)
  )
  AND image_url IN (
    SELECT image_url
    FROM public.cars
    WHERE image_url IS NOT NULL
    GROUP BY image_url
    HAVING COUNT(DISTINCT lower(brand) || ' ' || lower(model)) > 1
  );

UPDATE public.cars
SET image_urls = ARRAY[]::text[]
WHERE image_urls IS NULL;

COMMIT;

