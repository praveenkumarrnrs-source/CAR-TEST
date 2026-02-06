-- Add unique constraint for cars table to enable upsert
CREATE UNIQUE INDEX IF NOT EXISTS cars_brand_model_variant_idx 
ON public.cars (brand, model, COALESCE(variant, ''));

-- Add index for faster search queries
CREATE INDEX IF NOT EXISTS cars_search_idx 
ON public.cars USING gin(to_tsvector('english', brand || ' ' || model || ' ' || COALESCE(variant, '')));