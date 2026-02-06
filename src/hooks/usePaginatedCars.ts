import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 12;

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

interface Filters {
  brand?: string;
  fuelType?: string;
  bodyType?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface UsePaginatedCarsResult {
  cars: Car[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  refresh: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  isSearching: boolean;
}

export const usePaginatedCars = (): UsePaginatedCarsResult => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [isSearching, setIsSearching] = useState(false);
  const [hasScrapeAttempted, setHasScrapeAttempted] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query - 400ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset scrape flag when search changes
      if (searchQuery !== debouncedSearchQuery) {
        setHasScrapeAttempted(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setPage(0);
    setCars([]);
    setHasMore(true);
  }, [debouncedSearchQuery, filters]);

  // Build query with all filters
  const buildQuery = useCallback((currentSearch: string, currentFilters: Filters) => {
    let query = supabase
      .from('cars')
      .select('id, brand, model, variant, year, fuel_type, transmission, engine_cc, mileage, body_type, ex_showroom_price, on_road_price, condition, rating, image_url, image_urls, source, source_url', { count: 'exact' });

    // Apply search query - search across brand, model, and variant
    if (currentSearch.trim()) {
      const searchTerm = currentSearch.trim();
      query = query.or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,variant.ilike.%${searchTerm}%`);
    }

    // Apply filters
    if (currentFilters.brand && currentFilters.brand !== 'All') {
      query = query.ilike('brand', `%${currentFilters.brand}%`);
    }
    if (currentFilters.fuelType && currentFilters.fuelType !== 'All') {
      query = query.eq('fuel_type', currentFilters.fuelType);
    }
    if (currentFilters.bodyType && currentFilters.bodyType !== 'All') {
      query = query.ilike('body_type', `%${currentFilters.bodyType}%`);
    }
    if (currentFilters.minPrice !== undefined) {
      query = query.gte('ex_showroom_price', currentFilters.minPrice);
    }
    if (currentFilters.maxPrice !== undefined && currentFilters.maxPrice !== Infinity) {
      query = query.lte('ex_showroom_price', currentFilters.maxPrice);
    }

    return query.order('created_at', { ascending: false });
  }, []);

  // Fetch cars from database
  const fetchCars = useCallback(async (pageNum: number, append = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      console.log('Fetching cars - page:', pageNum, 'search:', debouncedSearchQuery, 'filters:', filters);
      
      const query = buildQuery(debouncedSearchQuery, filters)
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching cars:', error);
        if (!append) setCars([]);
        return { success: false, count: 0 };
      }

      const typedData = (data || []) as Car[];
      
      console.log('Fetched cars:', typedData.length, 'total count:', count);

      if (append) {
        setCars(prev => [...prev, ...typedData]);
      } else {
        setCars(typedData);
      }

      setTotalCount(count || 0);
      setHasMore(typedData.length === PAGE_SIZE);
      setPage(pageNum);

      return { success: true, count: count || 0, data: typedData };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, count: 0 };
      }
      console.error('Fetch error:', err);
      return { success: false, count: 0 };
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQuery, debouncedSearchQuery, filters]);

  // Trigger web scraping for missing cars
  const triggerWebScrape = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2 || hasScrapeAttempted) return;
    
    setIsSearching(true);
    setHasScrapeAttempted(true);
    
    console.log('Triggering web scrape for:', query);
    
    try {
      const { data, error } = await supabase.functions.invoke('scrape-cars', {
        body: { query },
      });

      if (error) {
        console.error('Scrape error:', error);
        toast({
          title: 'Search Notice',
          description: 'Could not search external sources. Showing local results only.',
          variant: 'default',
        });
        return;
      }

      console.log('Scrape response:', data);

      if (data?.cars && data.cars.length > 0) {
        toast({
          title: 'New Cars Found!',
          description: `Found ${data.cars.length} cars matching "${query}" from web sources`,
        });
        
        // Wait a moment for database to sync, then refresh
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reset loading state and fetch fresh data
        setLoading(true);
        setCars([]);
        
        const result = await buildQuery(query, filters)
          .range(0, PAGE_SIZE - 1)
          .then(res => res);
        
        if (result.data && !result.error) {
          setCars(result.data as Car[]);
          setTotalCount(result.count || 0);
          setHasMore((result.data?.length || 0) === PAGE_SIZE);
          setPage(0);
        }
        setLoading(false);
      } else {
        toast({
          title: 'No Results',
          description: `No cars found matching "${query}" in external sources`,
        });
      }
    } catch (err) {
      console.error('Web scrape error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [toast, hasScrapeAttempted, buildQuery, filters]);

  // Load more for infinite scroll
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchCars(page + 1, true);
    }
  }, [fetchCars, loadingMore, hasMore, page, loading]);

  // Manual refresh
  const refresh = useCallback(() => {
    setPage(0);
    setCars([]);
    setHasScrapeAttempted(false);
    fetchCars(0, false);
  }, [fetchCars]);

  // Fetch cars when search/filters change
  useEffect(() => {
    fetchCars(0, false);
  }, [debouncedSearchQuery, filters]);

  // Auto-trigger web scrape when no results found and there's a search query
  useEffect(() => {
    // Clear any existing timeout
    if (scrapeTimeoutRef.current) {
      clearTimeout(scrapeTimeoutRef.current);
    }

    // Only trigger if:
    // 1. Not loading
    // 2. No cars found
    // 3. There's a search query (at least 2 chars)
    // 4. Haven't already attempted scraping for this query
    if (!loading && cars.length === 0 && debouncedSearchQuery.length >= 2 && !hasScrapeAttempted && !isSearching) {
      console.log('Auto-triggering scrape - no local results for:', debouncedSearchQuery);
      
      // Small delay to ensure UI updates first
      scrapeTimeoutRef.current = setTimeout(() => {
        triggerWebScrape(debouncedSearchQuery);
      }, 500);
    }

    return () => {
      if (scrapeTimeoutRef.current) {
        clearTimeout(scrapeTimeoutRef.current);
      }
    };
  }, [loading, cars.length, debouncedSearchQuery, hasScrapeAttempted, isSearching, triggerWebScrape]);

  return {
    cars,
    loading,
    loadingMore,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    isSearching,
  };
};
