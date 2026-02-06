-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'auction_creator', 'admin');

-- Create enum for auction status
CREATE TYPE public.auction_status AS ENUM ('pending', 'active', 'ended', 'cancelled');

-- Create enum for bid status
CREATE TYPE public.bid_status AS ENUM ('active', 'outbid', 'won', 'cancelled');

-- Create enum for car condition
CREATE TYPE public.car_condition AS ENUM ('new', 'excellent', 'good', 'fair', 'poor');

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    kyc_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Create cars table for dynamic car data
CREATE TABLE public.cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    year INTEGER NOT NULL,
    fuel_type TEXT NOT NULL,
    transmission TEXT,
    engine_cc INTEGER,
    mileage TEXT,
    body_type TEXT,
    ex_showroom_price INTEGER,
    on_road_price INTEGER,
    condition car_condition DEFAULT 'good',
    rating NUMERIC(2,1) DEFAULT 4.0,
    image_url TEXT,
    image_urls TEXT[],
    specifications JSONB DEFAULT '{}',
    source TEXT,
    source_url TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create auctions table
CREATE TABLE public.auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    car_brand TEXT NOT NULL,
    car_model TEXT NOT NULL,
    car_year INTEGER NOT NULL,
    car_fuel_type TEXT NOT NULL,
    car_condition car_condition DEFAULT 'good',
    starting_price INTEGER NOT NULL,
    current_price INTEGER NOT NULL,
    reserve_price INTEGER,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status auction_status DEFAULT 'pending',
    bid_count INTEGER DEFAULT 0,
    winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_approved BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create bids table
CREATE TABLE public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
    bidder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    status bid_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'auction',
    auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create valuations table for price history
CREATE TABLE public.valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    car_brand TEXT NOT NULL,
    car_model TEXT NOT NULL,
    car_year INTEGER,
    fuel_type TEXT,
    registration_number TEXT,
    estimated_value INTEGER,
    min_value INTEGER,
    max_value INTEGER,
    demand_score NUMERIC(3,2),
    sources JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create scraped_prices table for caching
CREATE TABLE public.scraped_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    year INTEGER,
    fuel_type TEXT,
    price INTEGER,
    source TEXT NOT NULL,
    source_url TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (brand, model, variant, year, source)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_prices ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cars_updated_at
    BEFORE UPDATE ON public.cars
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auctions_updated_at
    BEFORE UPDATE ON public.auctions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for cars (public read, admin write)
CREATE POLICY "Cars are viewable by everyone"
    ON public.cars FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage cars"
    ON public.cars FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can insert cars"
    ON public.cars FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policies for auctions
CREATE POLICY "Auctions are viewable by everyone"
    ON public.auctions FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create auctions"
    ON public.auctions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own auctions"
    ON public.auctions FOR UPDATE
    TO authenticated
    USING (auth.uid() = creator_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bids
CREATE POLICY "Bids are viewable by everyone"
    ON public.bids FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can place bids"
    ON public.bids FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = bidder_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policies for valuations
CREATE POLICY "Users can view their own valuations"
    ON public.valuations FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can create valuations"
    ON public.valuations FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Anonymous can create valuations"
    ON public.valuations FOR INSERT
    WITH CHECK (user_id IS NULL);

-- RLS Policies for scraped_prices (public read)
CREATE POLICY "Scraped prices are viewable by everyone"
    ON public.scraped_prices FOR SELECT
    USING (true);

CREATE POLICY "System can manage scraped prices"
    ON public.scraped_prices FOR ALL
    TO authenticated
    WITH CHECK (true);

-- Enable realtime for auctions and bids
ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create indexes for performance
CREATE INDEX idx_cars_brand_model ON public.cars(brand, model);
CREATE INDEX idx_auctions_status ON public.auctions(status);
CREATE INDEX idx_auctions_end_time ON public.auctions(end_time);
CREATE INDEX idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_scraped_prices_brand_model ON public.scraped_prices(brand, model);