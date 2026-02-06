import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { indianBrands, fuelTypes, bodyTypes, priceRanges } from '@/lib/indianCarData';

interface Filters {
  brand?: string;
  fuelType?: string;
  bodyType?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  isSearching?: boolean;
}

export const SearchFilters = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  isSearching = false,
}: SearchFiltersProps) => {
  const hasActiveFilters = searchQuery || 
    (filters.brand && filters.brand !== 'All') || 
    (filters.fuelType && filters.fuelType !== 'All') || 
    (filters.bodyType && filters.bodyType !== 'All') ||
    filters.minPrice !== undefined;

  const clearFilters = () => {
    onSearchChange('');
    onFiltersChange({});
  };

  const handleBrandChange = (value: string) => {
    onFiltersChange({ ...filters, brand: value });
  };

  const handleFuelChange = (value: string) => {
    onFiltersChange({ ...filters, fuelType: value });
  };

  const handleBodyChange = (value: string) => {
    onFiltersChange({ ...filters, bodyType: value });
  };

  const handlePriceChange = (label: string) => {
    const range = priceRanges.find(r => r.label === label);
    if (range && label !== 'All') {
      onFiltersChange({ 
        ...filters, 
        minPrice: range.min, 
        maxPrice: range.max 
      });
    } else {
      onFiltersChange({ 
        ...filters, 
        minPrice: undefined, 
        maxPrice: undefined 
      });
    }
  };

  const getCurrentPriceLabel = () => {
    if (filters.minPrice === undefined && filters.maxPrice === undefined) return 'All';
    const range = priceRanges.find(
      r => r.min === filters.minPrice && r.max === filters.maxPrice
    );
    return range?.label || 'All';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search any car... Swift, Nexon, Thar, Creta..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:flex items-center gap-3">
        <Select value={filters.brand || 'All'} onValueChange={handleBrandChange}>
          <SelectTrigger className="w-44 h-12">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            {indianBrands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.bodyType || 'All'} onValueChange={handleBodyChange}>
          <SelectTrigger className="w-40 h-12">
            <SelectValue placeholder="Body Type" />
          </SelectTrigger>
          <SelectContent>
            {bodyTypes.map((body) => (
              <SelectItem key={body} value={body}>
                {body}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.fuelType || 'All'} onValueChange={handleFuelChange}>
          <SelectTrigger className="w-36 h-12">
            <SelectValue placeholder="Fuel Type" />
          </SelectTrigger>
          <SelectContent>
            {fuelTypes.map((fuel) => (
              <SelectItem key={fuel} value={fuel}>
                {fuel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={getCurrentPriceLabel()} onValueChange={handlePriceChange}>
          <SelectTrigger className="w-44 h-12">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((range) => (
              <SelectItem key={range.label} value={range.label}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
