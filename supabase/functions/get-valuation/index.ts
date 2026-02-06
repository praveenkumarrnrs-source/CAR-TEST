import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brand, model, year, fuelType, registrationNumber } = await req.json();

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Valuation service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if we have recent cached prices
    const { data: cachedPrices } = await supabase
      .from('scraped_prices')
      .select('*')
      .ilike('brand', `%${brand}%`)
      .ilike('model', `%${model}%`)
      .gte('scraped_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('scraped_at', { ascending: false });

    let prices: number[] = [];
    const sources: { name: string; price: number; url: string }[] = [];

    if (cachedPrices && cachedPrices.length > 0) {
      prices = cachedPrices.map(p => p.price).filter((p): p is number => p !== null);
      for (const p of cachedPrices) {
        if (p.price) {
          sources.push({
            name: p.source || 'Unknown',
            price: p.price,
            url: p.source_url || '',
          });
        }
      }
    } else {
      // Scrape fresh data
      const searchQuery = `${brand} ${model} ${year || ''} used car price India`;
      
      console.log('Searching for valuation:', searchQuery);

      const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 15,
          scrapeOptions: {
            formats: ['markdown'],
          },
        }),
      });

      const searchData = await searchResponse.json();

      if (searchData.data) {
        for (const result of searchData.data) {
          const content = result.markdown || result.description || '';
          
          // Extract prices from content
          const priceMatches = content.matchAll(/₹\s*([\d,.]+)\s*(Lakh|Crore|L|Cr)?/gi);
          for (const match of priceMatches) {
            const numStr = match[1].replace(/,/g, '');
            let price = parseFloat(numStr);
            if (match[2]?.toLowerCase().includes('lakh') || match[2] === 'L') {
              price = price * 100000;
            } else if (match[2]?.toLowerCase().includes('crore') || match[2] === 'Cr') {
              price = price * 10000000;
            }
            
            if (price > 50000 && price < 100000000) { // Reasonable car price range
              prices.push(price);
              
              let sourceName = 'Web';
              if (result.url?.includes('carwale')) sourceName = 'CarWale';
              else if (result.url?.includes('cars24')) sourceName = 'Cars24';
              else if (result.url?.includes('spinny')) sourceName = 'Spinny';
              else if (result.url?.includes('cardekho')) sourceName = 'CarDekho';
              else if (result.url?.includes('olx')) sourceName = 'OLX Autos';
              
              sources.push({
                name: sourceName,
                price: Math.round(price),
                url: result.url || '',
              });

              // Cache the price
              const { error: cacheError } = await supabase.from('scraped_prices').upsert({
                brand,
                model,
                year: year || new Date().getFullYear(),
                price: Math.round(price),
                source: sourceName,
                source_url: result.url,
                scraped_at: new Date().toISOString(),
              }, {
                onConflict: 'brand,model,variant,year,source',
              });
              
              if (cacheError) {
                console.log('Cache error:', cacheError);
              }
            }
          }
        }
      }
    }

    // Calculate valuation statistics
    if (prices.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not find pricing data for this vehicle',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sortedPrices = prices.sort((a, b) => a - b);
    const minValue = sortedPrices[0];
    const maxValue = sortedPrices[sortedPrices.length - 1];
    const avgValue = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    // Remove outliers for better estimate
    const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
    const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
    const iqr = q3 - q1;
    const filteredPrices = prices.filter(p => p >= q1 - 1.5 * iqr && p <= q3 + 1.5 * iqr);
    const estimatedValue = filteredPrices.length > 0 
      ? filteredPrices.reduce((a, b) => a + b, 0) / filteredPrices.length
      : avgValue;

    // Calculate demand score (0-1) based on number of listings and price consistency
    const priceVariance = Math.sqrt(prices.reduce((acc, p) => acc + Math.pow(p - avgValue, 2), 0) / prices.length);
    const demandScore = Math.min(1, Math.max(0, 
      (0.5 + (sources.length / 30) - (priceVariance / avgValue))
    ));

    // Store valuation in database
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    const { error: valuationError } = await supabase.from('valuations').insert({
      user_id: userId,
      car_brand: brand,
      car_model: model,
      car_year: year,
      fuel_type: fuelType,
      registration_number: registrationNumber,
      estimated_value: Math.round(estimatedValue),
      min_value: Math.round(minValue),
      max_value: Math.round(maxValue),
      demand_score: Math.round(demandScore * 100) / 100,
      sources: sources.slice(0, 10),
    });
    
    if (valuationError) {
      console.log('Valuation storage error:', valuationError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        valuation: {
          estimatedValue: Math.round(estimatedValue),
          minValue: Math.round(minValue),
          maxValue: Math.round(maxValue),
          demandScore: Math.round(demandScore * 100) / 100,
          sources: sources.slice(0, 5),
          priceCount: prices.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-valuation function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
