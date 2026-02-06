import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Gavel, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuctionCard } from './AuctionCard';
import { useAuctions } from '@/hooks/useAuctions';

export const LiveAuctions = () => {
  const { auctions, loading } = useAuctions();

  const now = new Date();
  const liveAuctions = auctions.filter(
    (a) => a.status === 'active' && new Date(a.end_time) > now
  ).slice(0, 4);

  return (
    <section className="py-24 bg-secondary/30">
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
            <div className="flex items-center gap-3 mb-3">
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Live Auctions
              </h2>
              <span className="flex items-center gap-1.5 bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                {liveAuctions.length} Active
              </span>
            </div>
            <p className="text-muted-foreground max-w-lg">
              Bid on verified pre-owned cars from across India. 
              All prices in ₹ INR with transparent bidding.
            </p>
          </div>
          <Link to="/auctions" className="mt-4 md:mt-0">
            <Button variant="outline" className="gap-2 group border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground">
              <Gavel className="w-4 h-4" />
              All Auctions
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Auctions Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : liveAuctions.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {liveAuctions.map((auction, index) => (
              <AuctionCard key={auction.id} auction={auction} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No live auctions right now</p>
            <p className="text-sm text-muted-foreground">Check back soon for new listings</p>
          </div>
        )}
      </div>
    </section>
  );
};
