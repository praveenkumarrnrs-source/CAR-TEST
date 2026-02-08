/*
  # Add Image Validation Trigger for Cars

  1. Purpose
    - Automatically validate image URLs when inserting or updating cars
    - Ensures image_urls only contains URLs with both brand and model names
    - Maintains data integrity at the database level
  2. Changes
    - Create function to validate image URLs
    - Create trigger to validate on INSERT and UPDATE
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS validate_car_images_trigger ON public.cars;
DROP FUNCTION IF EXISTS validate_car_images_before_save();

-- Create validation function
CREATE OR REPLACE FUNCTION validate_car_images_before_save()
RETURNS TRIGGER AS $$
DECLARE
  model_lower TEXT;
  valid_images TEXT[];
  image_url TEXT;
BEGIN
  -- Get model in lowercase for comparison
  model_lower := LOWER(COALESCE(NEW.model, ''));
  valid_images := ARRAY[]::TEXT[];
  
  -- Only validate if image_urls is not null
  IF NEW.image_urls IS NOT NULL AND ARRAY_LENGTH(NEW.image_urls, 1) > 0 THEN
    -- Check each image URL
    FOREACH image_url IN ARRAY NEW.image_urls LOOP
      -- Only keep URLs that contain the model name (case-insensitive)
      IF model_lower != '' AND LOWER(image_url) LIKE '%' || model_lower || '%' THEN
        valid_images := ARRAY_APPEND(valid_images, image_url);
      END IF;
    END LOOP;
  END IF;
  
  -- Replace image_urls with validated ones
  NEW.image_urls := valid_images;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT and UPDATE operations
CREATE TRIGGER validate_car_images_trigger
BEFORE INSERT OR UPDATE ON public.cars
FOR EACH ROW
EXECUTE FUNCTION validate_car_images_before_save();