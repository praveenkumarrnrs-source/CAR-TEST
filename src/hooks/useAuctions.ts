import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Auction = Database['public']['Tables']['auctions']['Row'];
type Bid = Database['public']['Tables']['bids']['Row'];

export const useAuctions = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAuctions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching auctions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load auctions',
        variant: 'destructive',
      });
    } else {
      setAuctions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAuctions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('auctions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'auctions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAuctions((prev) => [payload.new as Auction, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAuctions((prev) =>
              prev.map((a) => (a.id === payload.new.id ? (payload.new as Auction) : a))
            );
          } else if (payload.eventType === 'DELETE') {
            setAuctions((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { auctions, loading, refetch: fetchAuctions };
};

export const useAuctionBids = (auctionId: string | undefined) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auctionId) return;

    const fetchBids = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false });

      if (!error && data) {
        setBids(data);
      }
      setLoading(false);
    };

    fetchBids();

    // Subscribe to real-time bid updates
    const channel = supabase
      .channel(`bids-${auctionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bids', filter: `auction_id=eq.${auctionId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBids((prev) => [payload.new as Bid, ...prev].sort((a, b) => b.amount - a.amount));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  return { bids, loading };
};

export const usePlaceBid = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const placeBid = async (auctionId: string, amount: number, userId: string) => {
    setLoading(true);

    try {
      // Insert the bid
      const { error: bidError } = await supabase.from('bids').insert({
        auction_id: auctionId,
        bidder_id: userId,
        amount,
        status: 'active',
      });

      if (bidError) throw bidError;

      // Get current bid count and update auction
      const { data: auctionData } = await supabase
        .from('auctions')
        .select('bid_count')
        .eq('id', auctionId)
        .single();

      if (auctionData) {
        await supabase
          .from('auctions')
          .update({ 
            current_price: amount, 
            bid_count: (auctionData.bid_count || 0) + 1 
          })
          .eq('id', auctionId);
      }

      toast({
        title: 'Bid Placed!',
        description: `Your bid of ₹${(amount / 100000).toFixed(2)} Lakh has been placed.`,
      });

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place bid';
      toast({
        title: 'Bid Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { placeBid, loading };
};

export const useCreateAuction = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createAuction = async (auctionData: {
    carBrand: string;
    carModel: string;
    carYear: number;
    fuelType: string;
    condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
    startingPrice: number;
    duration: number; // in hours
    description?: string;
    imageUrl?: string;
  }) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to create an auction');

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + auctionData.duration * 60 * 60 * 1000);

      const { data, error } = await supabase.from('auctions').insert({
        creator_id: user.id,
        title: `${auctionData.carBrand} ${auctionData.carModel} ${auctionData.carYear}`,
        description: auctionData.description || '',
        car_brand: auctionData.carBrand,
        car_model: auctionData.carModel,
        car_year: auctionData.carYear,
        car_fuel_type: auctionData.fuelType,
        car_condition: auctionData.condition,
        starting_price: auctionData.startingPrice,
        current_price: auctionData.startingPrice,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'active',
        image_url: auctionData.imageUrl,
      }).select().single();

      if (error) throw error;

      // Send notification to all users about new auction
      try {
        await supabase.functions.invoke('send-auction-notification', {
          body: {
            type: 'new_auction',
            auctionId: data.id,
            title: '🔔 New Auction Started!',
            message: `${auctionData.carBrand} ${auctionData.carModel} (${auctionData.carYear}) is now up for auction starting at ₹${(auctionData.startingPrice / 100000).toFixed(2)} Lakh!`,
          },
        });
      } catch (notifError) {
        console.error('Failed to send notifications:', notifError);
        // Don't fail the auction creation if notification fails
      }

      toast({
        title: 'Auction Created!',
        description: 'Your auction is now live and users have been notified!',
      });

      return { success: true, auction: data };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      toast({
        title: 'Failed to Create Auction',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { createAuction, loading };
};
