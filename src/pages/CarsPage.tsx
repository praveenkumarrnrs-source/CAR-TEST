import { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CarCard } from '@/components/CarCard';
import { Button } from '@/components/ui/button';
import { usePaginatedCars } from '@/hooks/usePaginatedCars';
import { SearchFilters } from '@/components/cars/SearchFilters';
import { MobileFilters } from '@/components/cars/MobileFilters';
import { CarGridSkeleton } from '@/components/cars/CarGridSkeleton';
import { InfiniteScrollTrigger } from '@/components/cars/InfiniteScrollTrigger';
import { EmptyState } from '@/components/cars/EmptyState';
import { normalizeCar } from '@/types/car';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CarsPage = () => {
  const {
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
  } = usePaginatedCars();
  
  const { toast } = useToast();
  
  // Note: Debouncing is now handled inside usePaginatedCars hook
  
  // Normalize cars for display
  const normalizedCars = useMemo(() => 
    cars.map(car => normalizeCar(car as Parameters<typeof normalizeCar>[0])),
    [cars]
  );

  const hasActiveFilters = useMemo(() => 
    searchQuery || 
    (filters.brand && filters.brand !== 'All') || 
    (filters.fuelType && filters.fuelType !== 'All') || 
    (filters.bodyType && filters.bodyType !== 'All') ||
    filters.minPrice !== undefined,
    [searchQuery, filters]
  );

  const handleWebSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('scrape-cars', {
        body: { query: searchQuery },
      });

      if (error) {
        toast({
          title: 'Search Error',
          description: 'Could not search web sources',
          variant: 'destructive',
        });
        return;
      }

      if (data?.cars && data.cars.length > 0) {
        toast({
          title: 'Cars Found',
          description: `Found ${data.cars.length} results from web sources`,
        });
        refresh();
      } else {
        toast({
          title: 'No Results',
          description: 'No cars found matching your search',
        });
      }
    } catch (err) {
      console.error('Web search error:', err);
    }
  }, [searchQuery, refresh, toast]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({});
  }, [setSearchQuery, setFilters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  Browse Cars
                </h1>
                <p className="text-muted-foreground">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading cars...
                    </span>
                  ) : (
                    `Discover ${totalCount} cars from top Indian manufacturers`
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <SearchFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filters={filters}
                  onFiltersChange={setFilters}
                  isSearching={isSearching}
                />
              </div>
              
              <MobileFilters 
                filters={filters} 
                onFiltersChange={setFilters} 
              />
            </div>
          </motion.div>

          {/* Cars Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && normalizedCars.length === 0 ? (
              <CarGridSkeleton count={6} />
            ) : normalizedCars.length > 0 ? (
              <>
                {normalizedCars.map((car, index) => (
                  <CarCard key={car.id} car={car} index={index} />
                ))}
                
                <InfiniteScrollTrigger
                  onTrigger={loadMore}
                  loading={loadingMore}
                  hasMore={hasMore}
                />
              </>
            ) : (
              <EmptyState
                searchQuery={searchQuery}
                isSearching={isSearching}
                onWebSearch={handleWebSearch}
                onClearFilters={handleClearFilters}
                hasFilters={!!hasActiveFilters}
              />
            )}
          </div>

          {/* Loading more indicator at bottom */}
          {loadingMore && (
            <div className="mt-6">
              <CarGridSkeleton count={3} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CarsPage;
