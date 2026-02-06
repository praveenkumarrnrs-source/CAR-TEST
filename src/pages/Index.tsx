import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { CategorySection } from '@/components/CategorySection';
import { FeaturedCars } from '@/components/FeaturedCars';
import { LiveAuctions } from '@/components/LiveAuctions';
import { ValuationCTA } from '@/components/ValuationCTA';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategorySection />
      <FeaturedCars />
      <LiveAuctions />
      <ValuationCTA />
      <Footer />
    </div>
  );
};

export default Index;
