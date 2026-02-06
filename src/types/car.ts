// Unified Car type for the application
// Used by both static data and database-fetched cars

export interface Car {
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
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor' | 'New' | 'Excellent' | 'Good' | 'Fair' | null;
  rating: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  source: string | null;
  source_url: string | null;
  slug?: string | null;
  description?: string | null;
  features?: string[] | null;
  seating_capacity?: number | null;
  // Legacy fields for compatibility with static data
  exShowroomPrice?: number;
  onRoadPrice?: number;
  fuelType?: string;
  bodyType?: string;
  engineCC?: number;
  seatingCapacity?: number;
  image?: string;
  images?: string[];
  launchYear?: number;
  kmDriven?: number;
}

// Helper to normalize legacy Car data to unified format
export function normalizeCar(car: Partial<Car> & { id: string }): Car {
  return {
    id: car.id,
    brand: car.brand || '',
    model: car.model || '',
    variant: car.variant || null,
    year: car.year || car.launchYear || new Date().getFullYear(),
    fuel_type: car.fuel_type || car.fuelType || 'Petrol',
    transmission: car.transmission || null,
    engine_cc: car.engine_cc || car.engineCC || null,
    mileage: car.mileage?.toString() || null,
    body_type: car.body_type || car.bodyType || null,
    ex_showroom_price: car.ex_showroom_price || car.exShowroomPrice || null,
    on_road_price: car.on_road_price || car.onRoadPrice || null,
    condition: car.condition || null,
    rating: car.rating || null,
    image_url: car.image_url || car.image || null,
    image_urls: car.image_urls || car.images || null,
    source: car.source || null,
    source_url: car.source_url || null,
    slug: car.slug || null,
    description: car.description || null,
    features: car.features || null,
    seating_capacity: car.seating_capacity || null,
    // Keep legacy fields for backward compatibility
    exShowroomPrice: car.exShowroomPrice || car.ex_showroom_price || undefined,
    fuelType: car.fuelType || car.fuel_type,
    bodyType: car.bodyType || car.body_type || undefined,
    image: car.image || car.image_url || undefined,
    seatingCapacity: car.seatingCapacity,
  };
}

// Check if car image might be mismatched (generic placeholder)
export function isImagePotentiallyMismatched(car: Car): boolean {
  const imageUrl = car.image_url || car.image;
  if (!imageUrl) return true;
  
  // Check for known placeholder/stock image domains
  const placeholderIndicators = [
    'unsplash.com',
    'placeholder',
    'stock',
    'generic',
    'dummy',
  ];
  
  const urlLower = imageUrl.toLowerCase();
  return placeholderIndicators.some(indicator => urlLower.includes(indicator));
}
