import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarCard } from './CarCard';
import { cars as staticCars } from '@/lib/indianCarData';
import { normalizeCar } from '@/types/car';

export const FeaturedCars = () => {
  // Show popular Indian cars - normalize to unified Car type
  const featuredCars = staticCars.slice(0, 6).map(car => 
    normalizeCar({ 
      ...car, 
      mileage: car.mileage?.toString(),
      fuel_type: car.fuelType, 
      body_type: car.bodyType, 
      ex_showroom_price: car.exShowroomPrice, 
      on_road_price: car.onRoadPrice, 
      engine_cc: car.engineCC, 
      image_url: car.image, 
      image_urls: car.images 
    })
  );

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12"
        >
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Popular Cars in India
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Explore India's most loved cars from Maruti Suzuki, Tata, Hyundai, 
              Mahindra and more top manufacturers.
            </p>
          </div>
          <Link to="/cars" className="mt-4 md:mt-0">
            <Button variant="ghost" className="gap-2 group">
              View All Cars
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Cars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCars.map((car, index) => (
            <CarCard key={car.id} car={car} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
