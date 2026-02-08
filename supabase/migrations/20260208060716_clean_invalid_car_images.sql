/*
  # Clean and Validate Car Images

  1. Changes
    - Remove image URLs that don't contain the model name
    - Reset image_urls to empty array if no valid images exist
  2. Purpose
    - Ensures no car displays images from other models
    - Implements strict image validation per the business rules
    - Prevents data integrity issues with image mismatches
*/

DO $$
DECLARE
  car_record RECORD;
  model_lower TEXT;
  valid_images TEXT[];
  image_url TEXT;
BEGIN
  FOR car_record IN SELECT id, model, image_urls FROM public.cars LOOP
    model_lower := LOWER(car_record.model);
    valid_images := ARRAY[]::TEXT[];
    
    IF car_record.image_urls IS NOT NULL AND ARRAY_LENGTH(car_record.image_urls, 1) > 0 THEN
      FOREACH image_url IN ARRAY car_record.image_urls LOOP
        IF LOWER(image_url) LIKE '%' || model_lower || '%' THEN
          valid_images := ARRAY_APPEND(valid_images, image_url);
        END IF;
      END LOOP;
    END IF;
    
    UPDATE public.cars
    SET image_urls = valid_images
    WHERE id = car_record.id;
  END LOOP;
END $$;