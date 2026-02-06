import { motion } from 'framer-motion';
import { Gavel, Clock, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuctionCard } from '@/components/AuctionCard';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateAuctionModal } from '@/components/CreateAuctionModal';
import { useAuctions } from '@/hooks/useAuctions';
import { useAuth } from '@/contexts/AuthContext';

const AuctionsPage = () => {
  const { auctions, loading, refetch } = useAuctions();
  const { user } = useAuth();

  const now = new Date();
  const liveAuctions = auctions.filter(
    (a) => a.status === 'active' && new Date(a.end_time) > now
  );
  const upcomingAuctions = auctions.filter(
    (a) => a.status === 'pending' || new Date(a.start_time) > now
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <h1 className="font-display text-3xl md:text-4xl font-bold">
                  Car Auctions
                </h1>
                <Badge className="bg-destructive text-destructive-foreground animate-pulse gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-destructive-foreground" />
                  {liveAuctions.length} Live
                </Badge>
              </div>
              <CreateAuctionModal onSuccess={refetch} />
            </div>
            <p className="text-muted-foreground">
              Bid on verified pre-owned cars from across India • All prices in ₹ INR
              {!user && <span className="ml-2 text-primary">(Login to create auctions)</span>}
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="live" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="live" className="gap-2">
                  <Gavel className="w-4 h-4" />
                  Live Auctions ({liveAuctions.length})
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Upcoming ({upcomingAuctions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="live">
                {liveAuctions.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {liveAuctions.map((auction, index) => (
                      <AuctionCard key={auction.id} auction={auction} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">
                      No live auctions at the moment
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Check back soon or view upcoming auctions
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upcoming">
                {upcomingAuctions.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {upcomingAuctions.map((auction, index) => (
                      <AuctionCard key={auction.id} auction={auction} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">
                      No upcoming auctions scheduled
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 grid md:grid-cols-3 gap-6"
          >
            {[
              {
                title: 'Register to Bid',
                description: 'Create an account and complete KYC verification to participate in auctions across India.',
              },
              {
                title: 'Place Your Bid',
                description: 'Enter your maximum bid in ₹ INR and our system handles the rest automatically.',
              },
              {
                title: 'Win & Collect',
                description: 'Complete payment via UPI/NEFT and arrange RC transfer and vehicle delivery.',
              },
            ].map((step, index) => (
              <div key={step.title} className="bg-card rounded-xl border border-border p-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="font-display font-bold text-primary">{index + 1}</span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuctionsPage;
