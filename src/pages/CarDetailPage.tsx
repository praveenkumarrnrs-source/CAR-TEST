import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Gauge, Fuel, Settings, Shield, Check, Phone, Mail, Star, Users, MapPin, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type CarRow = Tables<'cars'> & {
  description?: string | null;
  features?: string[] | null;
  seating_capacity?: number | null;
  slug?: string | null;
};

// Format price in Indian Lakhs
function formatLakhs(price: number | null): string {
  if (!price) return 'Price on request';
  const lakhs = price / 100000;
  if (lakhs >= 100) {
    return `₹${(lakhs / 100).toFixed(2)} Crore`;
  }
  return `₹${lakhs.toFixed(2)} Lakh`;
}

const CarDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<CarRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) {
        setError('No car ID provided');
        setLoading(false);
        return;
      }

      try {
        // Try to find by slug first
        let { data, error: fetchError } = await supabase
          .from('cars')
          .select('*')
          .eq('slug', id)
          .maybeSingle();

        // If not found by slug, try by UUID
        if (!data && !fetchError) {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(id)) {
            const result = await supabase
              .from('cars')
              .select('*')
              .eq('id', id)
              .maybeSingle();
            data = result.data;
            fetchError = result.error;
          }
        }

        if (fetchError) {
          console.error('Error fetching car:', fetchError);
          setError('Failed to load car details');
        } else if (!data) {
          setError('Car not found');
        } else {
          setCar(data as CarRow);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || 'Car not found'}</h1>
          <p className="text-muted-foreground mb-4">
            The car you're looking for might have been removed or doesn't exist.
          </p>
          <Link to="/cars">
            <Button>Back to Cars</Button>
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = (() => {
    const brand = (car.brand || '').toLowerCase();
    const model = (car.model || '').toLowerCase();
    const urls = car.image_urls || [];
    const valid = urls.find(u => {
      const lower = (u || '').toLowerCase();
      return lower.includes(brand) && lower.includes(model);
    });
    return valid || '/car-placeholder.png';
  })();
  const fuelType = car.fuel_type || 'Petrol';
  const bodyType = car.body_type || 'Car';
  const transmission = car.transmission || 'Manual';
  const features = car.features || [];
  const description = car.description || `${car.brand} ${car.model} - A quality vehicle from ${car.brand}.`;
  const seatingCapacity = car.seating_capacity || 5;
  const engineCC = car.engine_cc || 0;
  const mileage = car.mileage || '—';
  const condition = car.condition || 'new';

  const specs = [
    { icon: Calendar, label: 'Year', value: car.year?.toString() || '—' },
    { icon: Gauge, label: 'Mileage', value: fuelType === 'Electric' ? `${mileage} km range` : `${mileage} km/l` },
    { icon: Fuel, label: 'Fuel Type', value: fuelType },
    { icon: Settings, label: 'Transmission', value: transmission },
    { icon: Users, label: 'Seating', value: `${seatingCapacity} Seater` },
    { icon: MapPin, label: 'Engine', value: engineCC > 0 ? `${engineCC} cc` : 'Electric' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-4">
          <Link to="/cars">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Cars
            </Button>
          </Link>
        </div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-[40vh] md:h-[50vh]"
        >
          <img
            src={imageUrl}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>

        <div className="container mx-auto px-4 -mt-24 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-6 md:p-8"
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="font-display text-3xl md:text-4xl font-bold">
                        {car.brand} {car.model}
                      </h1>
                    <Badge variant={condition === 'new' ? 'default' : 'secondary'}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                      </Badge>
                    </div>
                  {car.variant && (
                    <p className="text-lg text-muted-foreground">{car.variant}</p>
                  )}
                    <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-accent text-accent-foreground">{bodyType}</Badge>
                    {car.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="font-medium">{car.rating}</span>
                      </div>
                    )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium text-success">Verified</span>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {specs.map((spec) => (
                    <div key={spec.label} className="bg-secondary/50 rounded-lg p-4">
                      <spec.icon className="w-5 h-5 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">{spec.label}</p>
                      <p className="font-semibold">{spec.value}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Description */}
                <div className="mb-8">
                  <h2 className="font-display text-xl font-semibold mb-3">About this car</h2>
                  <p className="text-muted-foreground leading-relaxed">{description}</p>
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <div>
                  <h2 className="font-display text-xl font-semibold mb-4">Key Features</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:sticky lg:top-24 h-fit"
            >
              <div className="bg-card rounded-xl border border-border p-6">
                {/* Pricing */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Ex-Showroom Price</p>
                  <p className="text-3xl font-display font-bold text-primary mb-1">
                    {formatLakhs(car.ex_showroom_price)}
                  </p>
                  {car.on_road_price && (
                  <p className="text-sm text-muted-foreground">
                    On-Road: {formatLakhs(car.on_road_price)}
                  </p>
                  )}
                </div>

                <Button className="w-full h-12 btn-glow mb-3">
                  Contact Dealer
                </Button>
                <Button variant="outline" className="w-full h-12 mb-6">
                  Get Price Quote
                </Button>

                <Separator className="my-6" />

                <h3 className="font-semibold mb-4">Dealer Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>dealer@autovault.in</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Mumbai, Maharashtra</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2">Price sourced from</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{car.source || 'AutoVault'}</Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CarDetailPage;
