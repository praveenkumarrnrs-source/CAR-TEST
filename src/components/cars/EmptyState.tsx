import { motion } from 'framer-motion';
import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  searchQuery: string;
  isSearching: boolean;
  onWebSearch: () => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

export const EmptyState = ({
  searchQuery,
  isSearching,
  onWebSearch,
  onClearFilters,
  hasFilters,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full text-center py-20"
    >
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          {searchQuery ? `No cars found for "${searchQuery}"` : 'No cars found'}
        </h3>
        
        <p className="text-muted-foreground mb-6">
          {searchQuery 
            ? isSearching 
              ? "We're searching the web for this car..."
              : "Try searching the web for more results"
            : 'Adjust your filters to find more cars'}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {searchQuery && !isSearching && (
            <Button onClick={onWebSearch} className="gap-2">
              <Search className="w-4 h-4" />
              Search Web for "{searchQuery}"
            </Button>
          )}
          
          {isSearching && (
            <Button disabled className="gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Searching...
            </Button>
          )}
          
          {hasFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
