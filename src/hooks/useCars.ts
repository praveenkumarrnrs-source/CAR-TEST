import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Car {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number;
  fuel_type: string;
  transmission: string | null;
  engine_cc: number | null;
  mileage: string | null;
  body_type: string | null;
  ex_showroom_price: number | null;
  on_road_price: number | null;
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor' | null;
  rating: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  source: string | null;
  source_url: string | null;
}

export const useCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('id, brand, model, variant, year, fuel_type, transmission, engine_cc, mileage, body_type, ex_showroom_price, on_road_price, condition, rating, image_url, image_urls, source, source_url')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cars:', error);
      setCars([]);
    } else {
      setCars((data || []) as Car[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return { cars, loading, refetch: fetchCars };
};

export const useSearchCars = () => {
  const [results, setResults] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchCars = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      // First search in database
      const { data: dbCars, error } = await supabase
        .from('cars')
        .select('id, brand, model, variant, year, fuel_type, transmission, engine_cc, mileage, body_type, ex_showroom_price, on_road_price, condition, rating, image_url, image_urls, source, source_url')
        .or(`brand.ilike.%${query}%,model.ilike.%${query}%,variant.ilike.%${query}%`)
        .limit(20);

      if (dbCars && dbCars.length > 0) {
        setResults(dbCars as Car[]);
      } else {
        // If no results in DB, try to scrape
        const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape-cars', {
          body: { query },
        });

        if (scrapeError) {
          console.error('Scrape error:', scrapeError);
          toast({
            title: 'Search Error',
            description: 'Could not fetch car data. Please try again.',
            variant: 'destructive',
          });
        } else if (scrapeData?.cars) {
          setResults(scrapeData.cars as Car[]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, searchCars };
};

export const useScrapeCarData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const scrapeCarData = async (brand: string, model: string) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-cars', {
        body: { brand, model },
      });

      if (error) throw error;

      toast({
        title: 'Data Fetched',
        description: `Found ${data?.cars?.length || 0} results for ${brand} ${model}`,
      });

      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Could not fetch car data';
      toast({
        title: 'Scraping Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { scrapeCarData, loading };
};
