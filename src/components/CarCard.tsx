import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Fuel, Gauge, Calendar, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Car } from '@/types/car';

interface CarCardProps {
  car: Car;
  index?: number;
}

// Format price in Indian Lakhs format
function formatLakhs(price: number | null | undefined): string {
  if (!price) return 'Price on request';
  const lakhs = price / 100000;
  return `₹${lakhs.toFixed(2)} Lakh`;
}

// Get the best available image URL with validation
function getCarImage(car: Car): string {
  const urls = car.image_urls || [];
  const model = (car.model || '').toLowerCase();
  const brand = (car.brand || '').toLowerCase();
  const valid = urls.find(u => {
    const lower = (u || '').toLowerCase();
    return lower.includes(model) && lower.includes(brand);
  });
  if (valid) return valid;
  return '/car-placeholder.png';
}

export const CarCard = ({ car, index = 0 }: CarCardProps) => {
  const imageUrl = getCarImage(car);
  const carLink = `/cars/${car.slug || car.id}`;
  const price = car.ex_showroom_price || car.exShowroomPrice;
  const fuelType = car.fuel_type || car.fuelType || 'Petrol';
  const bodyType = car.body_type || car.bodyType || 'Car';
  const mileage = car.mileage || '—';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={carLink}>
        <Card className="group overflow-hidden card-hover bg-card border-border/50">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.currentTarget;
                // Prevent infinite loop
                if (!target.dataset.fallback) {
                  target.dataset.fallback = 'true';
                  target.src = '/car-placeholder.png';
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

            {/* Condition Badge */}
            {car.condition && (
              <Badge 
                className="absolute top-3 left-3"
                variant={car.condition === 'new' || car.condition === 'excellent' ? 'default' : 'secondary'}
              >
                {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
              </Badge>
            )}

            {/* Body Type Badge */}
            <Badge 
              className="absolute top-3 right-3 bg-accent text-accent-foreground"
            >
              {bodyType}
            </Badge>

            {/* Price */}
            <div className="absolute bottom-3 left-3">
              <p className="text-xl font-display font-bold text-primary-foreground">
                {formatLakhs(price)}
              </p>
              <p className="text-xs text-primary-foreground/70">Ex-showroom</p>
            </div>

            {/* Rating */}
            {car.rating && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur px-2 py-1 rounded-full">
                <Star className="w-3 h-3 fill-accent text-accent" />
                <span className="text-xs font-medium">{car.rating}</span>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            {/* Title */}
            <div className="mb-3">
              <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {car.brand} {car.model}
              </h3>
              {car.variant && (
                <p className="text-sm text-muted-foreground">{car.variant}</p>
              )}
            </div>

            {/* Specs */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{car.year}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4" />
                <span>{fuelType === 'Electric' ? `${mileage} km` : `${mileage} km/l`}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Fuel className="w-4 h-4" />
                <span>{fuelType}</span>
              </div>
            </div>

            {/* CTA */}
            <Button 
              variant="ghost" 
              className="w-full group/btn justify-between text-muted-foreground hover:text-primary"
            >
              View Details
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
