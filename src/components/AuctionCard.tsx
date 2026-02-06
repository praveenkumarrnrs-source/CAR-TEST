import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Gavel, Clock, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type Auction = Database['public']['Tables']['auctions']['Row'];

interface AuctionCardProps {
  auction: Auction;
  index?: number;
}

const formatLakhs = (amount: number) => {
  return `₹${(amount / 100000).toFixed(2)} Lakh`;
};

export const AuctionCard = ({ auction, index = 0 }: AuctionCardProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(auction.end_time).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.end_time]);

  const isLive = auction.status === 'active' && new Date(auction.end_time) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/auctions/${auction.id}`}>
        <Card className="group overflow-hidden card-hover bg-card border-border/50 relative">
          {/* Live Indicator */}
          {isLive && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-destructive text-destructive-foreground animate-pulse gap-1.5">
                <span className="w-2 h-2 rounded-full bg-destructive-foreground" />
                LIVE
              </Badge>
            </div>
          )}

          {/* Condition Badge */}
          {auction.car_condition && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="secondary" className="capitalize">
                {auction.car_condition}
              </Badge>
            </div>
          )}

          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={auction.image_url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'}
              alt={`${auction.car_brand} ${auction.car_model}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            
            {/* Timer */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">{timeLeft}</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground">
                <Users className="w-4 h-4" />
                <span>{auction.bid_count || 0} bids</span>
              </div>
            </div>
          </div>

          <CardContent className="p-4">
            {/* Title */}
            <div className="mb-3">
              <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {auction.car_brand} {auction.car_model}
              </h3>
              <p className="text-sm text-muted-foreground">
                {auction.car_year} • {auction.car_fuel_type}
              </p>
            </div>

            {/* Bid Info */}
            <div className="bg-secondary/50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current Bid</span>
                <div className="flex items-center gap-1 text-success text-sm">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{auction.bid_count || 0} bids</span>
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-accent">
                {formatLakhs(auction.current_price)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Starting: {formatLakhs(auction.starting_price)}
              </p>
            </div>

            {/* CTA */}
            <Button 
              className="w-full gap-2 btn-accent-glow bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Gavel className="w-4 h-4" />
              Place Bid
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
