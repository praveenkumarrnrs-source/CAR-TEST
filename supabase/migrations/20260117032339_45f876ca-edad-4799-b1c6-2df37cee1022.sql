-- Fix overly permissive policies by adding proper constraints

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert cars" ON public.cars;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can manage scraped prices" ON public.scraped_prices;
DROP POLICY IF EXISTS "Anonymous can create valuations" ON public.valuations;

-- Create more secure car insertion policy (only for auction creators and admins)
CREATE POLICY "Auction creators can insert cars"
    ON public.cars FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_role(auth.uid(), 'auction_creator') OR 
        public.has_role(auth.uid(), 'admin')
    );

-- Notifications can only be created by the system (via service role or for user's own notifications)
CREATE POLICY "Users can create their own notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Scraped prices should only be managed via service role (edge functions)
-- No user-facing insert policy needed, edge functions use service role

-- Valuations require user to be authenticated
CREATE POLICY "Authenticated users create valuations"
    ON public.valuations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);