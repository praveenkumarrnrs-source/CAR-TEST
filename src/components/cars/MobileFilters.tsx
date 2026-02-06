import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { indianBrands, fuelTypes, bodyTypes, priceRanges } from '@/lib/indianCarData';

interface Filters {
  brand?: string;
  fuelType?: string;
  bodyType?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface MobileFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export const MobileFilters = ({ filters, onFiltersChange }: MobileFiltersProps) => {
  const hasActiveFilters = (filters.brand && filters.brand !== 'All') || 
    (filters.fuelType && filters.fuelType !== 'All') || 
    (filters.bodyType && filters.bodyType !== 'All') ||
    filters.minPrice !== undefined;

  const clearFilters = () => {
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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden h-12 gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
              !
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Brand</label>
            <Select value={filters.brand || 'All'} onValueChange={handleBrandChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {indianBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Body Type</label>
            <Select value={filters.bodyType || 'All'} onValueChange={handleBodyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select body type" />
              </SelectTrigger>
              <SelectContent>
                {bodyTypes.map((body) => (
                  <SelectItem key={body} value={body}>
                    {body}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Fuel Type</label>
            <Select value={filters.fuelType || 'All'} onValueChange={handleFuelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                {fuelTypes.map((fuel) => (
                  <SelectItem key={fuel} value={fuel}>
                    {fuel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Price Range</label>
            <Select value={getCurrentPriceLabel()} onValueChange={handlePriceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select price range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.label} value={range.label}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="w-full gap-2">
              <X className="w-4 h-4" />
              Clear All Filters
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
