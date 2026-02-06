import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Indian car brands and models for validation
const INDIAN_CAR_BRANDS = [
  'Maruti Suzuki', 'Maruti', 'Tata', 'Tata Motors', 'Mahindra', 
  'Hyundai', 'Kia', 'Honda', 'Toyota', 'Skoda', 'Volkswagen', 
  'MG', 'Renault', 'Nissan', 'Ford', 'Jeep', 'BMW', 'Mercedes-Benz', 
  'Mercedes', 'Audi', 'Volvo', 'Lexus', 'Citroen', 'BYD'
];

const INDIAN_CAR_MODELS: Record<string, string[]> = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'WagonR', 'Alto', 'Brezza', 'Fronx', 'Jimny', 'Grand Vitara', 'XL6', 'Ertiga', 'Dzire', 'Ciaz', 'S-Cross', 'Ignis', 'Celerio', 'S-Presso'],
  'Tata': ['Nexon', 'Punch', 'Tiago', 'Altroz', 'Harrier', 'Safari', 'Curvv', 'Tigor', 'Nexon EV'],
  'Mahindra': ['Thar', 'Scorpio', 'Scorpio-N', 'XUV700', 'XUV400', 'XUV300', 'Bolero', 'BE 6', 'XUV 3XO'],
  'Hyundai': ['Creta', 'Venue', 'i20', 'i10', 'Verna', 'Tucson', 'Alcazar', 'Exter', 'Aura', 'Ioniq 5'],
  'Kia': ['Seltos', 'Sonet', 'Carens', 'EV6', 'EV9'],
  'Honda': ['City', 'Amaze', 'Elevate', 'WR-V'],
  'Toyota': ['Fortuner', 'Innova', 'Innova Crysta', 'Innova Hycross', 'Urban Cruiser', 'Glanza', 'Rumion', 'Camry', 'Land Cruiser'],
  'Skoda': ['Kushaq', 'Slavia', 'Kodiaq', 'Superb'],
  'Volkswagen': ['Taigun', 'Virtus', 'Tiguan'],
  'MG': ['Hector', 'Astor', 'Comet', 'ZS EV', 'Windsor'],
  'Renault': ['Kwid', 'Kiger', 'Triber'],
};

// Detect Indian car brand and model from search query
function detectIndianCar(query: string): { brand: string; model: string } | null {
  const queryLower = query.toLowerCase().trim();
  
  // First check if the query directly matches a model
  for (const [brand, models] of Object.entries(INDIAN_CAR_MODELS)) {
    for (const model of models) {
      if (queryLower.includes(model.toLowerCase())) {
        return { brand, model };
      }
    }
  }
  
  // Check for brand + model pattern
  for (const brand of INDIAN_CAR_BRANDS) {
    if (queryLower.includes(brand.toLowerCase())) {
      return { brand, model: queryLower.replace(brand.toLowerCase(), '').trim() };
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, brand, model, scrapeImages = true, imageOnly = false } = await req.json();
    
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Scraping service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect if this is an Indian car
    const detectedCar = detectIndianCar(query || `${brand} ${model}`);
    
    // Build targeted search query specifically for Indian car websites
    let searchQuery: string;
    if (detectedCar) {
      // Use specific Indian car sites for better results
      searchQuery = `${detectedCar.brand} ${detectedCar.model} car price specifications India site:carwale.com OR site:cardekho.com OR site:cars24.com OR site:autoportal.com`;
    } else if (brand && model) {
      searchQuery = `${brand} ${model} car price specifications India site:carwale.com OR site:cardekho.com`;
    } else {
      // Generic search with India context
      searchQuery = `${query} car price India site:carwale.com OR site:cardekho.com OR site:cars24.com`;
    }
    
    console.log('Searching for:', searchQuery);
    console.log('Detected car:', detectedCar);

    // Search for car details
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 10,
        scrapeOptions: {
          formats: ['markdown', 'links'],
        },
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Firecrawl search error:', searchData);
      return new Response(
        JSON.stringify({ success: false, error: 'Search failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Search results count:', searchData.data?.length || 0);

    // Parse the results with enhanced extraction
    const cars: Record<string, unknown>[] = [];
    const carMap = new Map<string, Record<string, unknown>>();
    
    if (searchData.data) {
      for (const result of searchData.data) {
        const carInfo = parseCarInfo(result.markdown || result.description || '', result.url, detectedCar);
        if (carInfo && carInfo.brand && carInfo.model) {
          // Use brand+model as key to merge data from multiple sources
          const key = `${carInfo.brand}-${carInfo.model}`.toLowerCase();
          const existing = carMap.get(key);
          
          if (existing) {
            // Merge: prefer non-null values, collect multiple prices for averaging
            if (!existing.image_url && carInfo.image_url) {
              existing.image_url = carInfo.image_url;
            }
            const newImages = carInfo.image_urls as string[] | undefined;
            if (newImages && newImages.length) {
              const existingImages = existing.image_urls as string[] || [];
              existing.image_urls = [...existingImages, ...newImages].slice(0, 8);
            }
            if (!existing.ex_showroom_price && carInfo.ex_showroom_price) {
              existing.ex_showroom_price = carInfo.ex_showroom_price;
            }
            // Collect prices from different sources
            if (!existing.prices) existing.prices = [];
            if (carInfo.ex_showroom_price) {
              (existing.prices as number[]).push(carInfo.ex_showroom_price as number);
            }
            // Keep track of sources
            if (!existing.sources) existing.sources = [];
            (existing.sources as string[]).push(carInfo.source as string);
          } else {
            carInfo.prices = carInfo.ex_showroom_price ? [carInfo.ex_showroom_price] : [];
            carInfo.sources = [carInfo.source];
            carMap.set(key, carInfo);
          }
        }
      }
    }

    // If we have a detected car but no results, add it with basic info
    if (detectedCar && carMap.size === 0) {
      const key = `${detectedCar.brand}-${detectedCar.model}`.toLowerCase();
      carMap.set(key, {
        brand: detectedCar.brand,
        model: detectedCar.model,
        variant: null,
        year: new Date().getFullYear(),
        fuel_type: 'Petrol',
        body_type: null,
        transmission: null,
        mileage: null,
        engine_cc: null,
        ex_showroom_price: null,
        image_url: null,
        image_urls: [],
        source: 'AutoVault',
        source_url: null,
        prices: [],
        sources: ['AutoVault'],
      });
    }

    // Convert map to array and calculate average prices
    for (const [, car] of carMap) {
      const prices = car.prices as number[] || [];
      if (prices.length > 0) {
        car.ex_showroom_price = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      }
      delete car.prices;
      cars.push(car);
    }

    console.log('Parsed cars:', cars.length);

    // Store in database if we found cars
    if (cars.length > 0) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      for (const car of cars) {
        if (!car.brand || !car.model) {
          console.log('Skipping car without brand/model:', car);
          continue;
        }

        // Check if car already exists
        const { data: existingCar } = await supabase
          .from('cars')
          .select('id')
          .eq('brand', car.brand)
          .eq('model', car.model)
          .is('variant', car.variant || null)
          .maybeSingle();

        if (existingCar) {
          // Filter out URLs already used by different models
          const verifiedUrls: string[] = [];
          for (const u of (car.image_urls as string[]) || []) {
            const lower = (u || '').toLowerCase();
            if (!lower) continue;
            const { data: conflict } = await supabase
              .from('cars')
              .select('id,brand,model')
              .or(`image_url.eq.${u},image_urls.cs.{${JSON.stringify([u]).replace(/[\[\]]/g, '')}}`)
              .limit(1);
            if (conflict && conflict.length > 0) {
              const other = conflict[0];
              const sameModel = (other.brand?.toLowerCase() === (car.brand as string).toLowerCase()) &&
                                (other.model?.toLowerCase() === (car.model as string).toLowerCase());
              if (!sameModel) continue;
            }
            verifiedUrls.push(u);
          }
          const primary = verifiedUrls[0] || null;
          const updatePayload: Record<string, unknown> = imageOnly
            ? {
                image_url: primary,
                image_urls: verifiedUrls,
                scraped_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : {
                year: car.year || new Date().getFullYear(),
                fuel_type: car.fuel_type || 'Petrol',
                ex_showroom_price: car.ex_showroom_price || null,
                on_road_price: car.on_road_price || null,
                body_type: car.body_type || null,
                transmission: car.transmission || null,
                engine_cc: car.engine_cc || null,
                mileage: car.mileage || null,
                image_url: primary,
                image_urls: verifiedUrls,
                source: (car.sources as string[])?.join(', ') || car.source || null,
                source_url: car.source_url || null,
                scraped_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
          const { error: updateError } = await supabase
            .from('cars')
            .update(updatePayload)
            .eq('id', existingCar.id);
          
          if (updateError) {
            console.log('Update error:', updateError);
          } else {
            console.log('Updated car:', car.brand, car.model);
          }
        } else {
          const verifiedUrls: string[] = [];
          for (const u of (car.image_urls as string[]) || []) {
            const lower = (u || '').toLowerCase();
            if (!lower) continue;
            const { data: conflict } = await supabase
              .from('cars')
              .select('id,brand,model')
              .or(`image_url.eq.${u},image_urls.cs.{${JSON.stringify([u]).replace(/[\[\]]/g, '')}}`)
              .limit(1);
            if (conflict && conflict.length > 0) {
              const other = conflict[0];
              const sameModel = (other.brand?.toLowerCase() === (car.brand as string).toLowerCase()) &&
                                (other.model?.toLowerCase() === (car.model as string).toLowerCase());
              if (!sameModel) continue;
            }
            verifiedUrls.push(u);
          }
          const primary = verifiedUrls[0] || null;
          const { error: insertError } = await supabase.from('cars').insert({
            brand: car.brand as string,
            model: car.model as string,
            variant: (car.variant as string) || null,
            year: (car.year as number) || new Date().getFullYear(),
            fuel_type: (car.fuel_type as string) || 'Petrol',
            ex_showroom_price: car.ex_showroom_price as number | null,
            on_road_price: car.on_road_price as number | null,
            body_type: car.body_type as string | null,
            transmission: car.transmission as string | null,
            engine_cc: car.engine_cc as number | null,
            mileage: car.mileage as string | null,
            image_url: primary,
            image_urls: verifiedUrls,
            source: (car.sources as string[])?.join(', ') || (car.source as string) || null,
            source_url: car.source_url as string | null,
            scraped_at: new Date().toISOString(),
          });
          
          if (insertError) {
            console.log('Insert error:', insertError);
          } else {
            console.log('Inserted car:', car.brand, car.model);
          }
        }

        // Store in scraped_prices for price tracking
        if (car.ex_showroom_price) {
          const { error: priceError } = await supabase.from('scraped_prices').insert({
            brand: car.brand as string,
            model: car.model as string,
            variant: car.variant as string | null,
            year: car.year as number,
            price: car.ex_showroom_price as number,
            fuel_type: car.fuel_type as string,
            source: car.source as string,
            source_url: car.source_url as string,
          });
          
          if (priceError) {
            console.log('Price insert error:', priceError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        cars,
        count: cars.length,
        message: `Found ${cars.length} cars matching "${query || `${brand} ${model}`}"`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-cars function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Extract and validate image URL from markdown content
function extractImageUrls(markdown: string, brand: string, model: string): string[] {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const urlRegex = /(https?:\/\/[^\s"']+(?:\.jpg|\.png|\.webp))/gi;
  const brandLower = brand.toLowerCase();
  const modelLower = model.toLowerCase();
  const brandToken = brandLower.replace(/\s|-/g, '');
  const modelToken = modelLower.replace(/\s|-/g, '');
  const rejectTokens = ['side', 'profile', 'banner', 'promo'];
  const acceptTokens = ['front', 'front-left', 'frontleft', '3-4', '3/4', 'three-quarter', 'threequarter', 'quarter'];
  const preferredDomains = ['static.carwale.com', 'imgd.aeplcdn.com'];
  const trustedDomains = ['carwale.com', 'cardekho.com', 'autoportal', 'zigwheels', 'cars24',
    'marutisuzuki', 'tatamotors', 'mahindra', 'kia', 'hyundai', 'honda', 'toyota'];
  const candidates: { url: string; score: number }[] = [];
  let m;
  while ((m = imageRegex.exec(markdown)) !== null) {
    const alt = m[1].toLowerCase();
    const url = m[2];
    if (!url.startsWith('http')) continue;
    const lower = url.toLowerCase();
    if (!(/\.(jpg|png|webp)\b/i.test(lower))) continue;
    const lowerTokens = lower.replace(/\s|-/g, '');
    if (!(lowerTokens.includes(brandToken) && lowerTokens.includes(modelToken))) continue;
    if (rejectTokens.some(t => lower.includes(t) || alt.includes(t))) continue;
    let score = 0;
    if (acceptTokens.some(t => lower.includes(t) || alt.includes(t))) score += 3;
    if (preferredDomains.some(d => lower.includes(d))) score += 3;
    if (trustedDomains.some(d => lower.includes(d))) score += 1;
    candidates.push({ url, score });
  }
  const rawUrls = markdown.match(urlRegex) || [];
  for (const url of rawUrls) {
    const lower = url.toLowerCase();
    const lowerTokens = lower.replace(/\s|-/g, '');
    if (!(lowerTokens.includes(brandToken) && lowerTokens.includes(modelToken))) continue;
    if (rejectTokens.some(t => lower.includes(t))) continue;
    let score = 0;
    if (acceptTokens.some(t => lower.includes(t))) score += 3;
    if (preferredDomains.some(d => lower.includes(d))) score += 3;
    if (trustedDomains.some(d => lower.includes(d))) score += 1;
    candidates.push({ url, score });
  }
  const unique = new Map<string, number>();
  for (const c of candidates) {
    if (!unique.has(c.url) || (unique.get(c.url) as number) < c.score) unique.set(c.url, c.score);
  }
  const sorted = [...unique.entries()].sort((a, b) => b[1] - a[1]).map(([u]) => u);
  return sorted.slice(0, 8);
}

function parseCarInfo(markdown: string, url: string, detectedCar: { brand: string; model: string } | null): Record<string, unknown> | null {
  try {
    // Extract price - look for ₹ followed by numbers with various formats
    const pricePatterns = [
      /₹\s*([\d,.]+)\s*(Lakh|Crore|L|Cr)?/i,
      /Rs\.?\s*([\d,.]+)\s*(Lakh|Crore|L|Cr)?/i,
      /Price[:\s]*([\d,.]+)\s*(Lakh|Crore|L|Cr)?/i,
      /Ex-showroom[:\s]*₹?\s*([\d,.]+)\s*(Lakh|Crore|L|Cr)?/i,
      /Starting\s+(?:from\s+)?₹?\s*([\d,.]+)\s*(Lakh|Crore|L|Cr)?/i,
    ];
    
    let price = 0;
    for (const pattern of pricePatterns) {
      const priceMatch = markdown.match(pattern);
      if (priceMatch) {
        const numStr = priceMatch[1].replace(/,/g, '');
        price = parseFloat(numStr);
        const suffix = priceMatch[2]?.toLowerCase() || '';
        if (suffix.includes('lakh') || suffix === 'l') {
          price = price * 100000;
        } else if (suffix.includes('crore') || suffix === 'cr') {
          price = price * 10000000;
        } else if (price < 100) {
          // Assume lakhs if price is too low (e.g., "8.5" means 8.5 Lakh)
          price = price * 100000;
        }
        if (price > 100000) break; // Found valid price
      }
    }

    // Use detected car info if available, otherwise try to extract from markdown
    let brand = detectedCar?.brand || '';
    let model = detectedCar?.model || '';
    
    if (!brand || !model) {
      // Try to find brand first
      for (const b of INDIAN_CAR_BRANDS) {
        if (markdown.toLowerCase().includes(b.toLowerCase())) {
          brand = b === 'Maruti' ? 'Maruti Suzuki' : b;
          break;
        }
      }
      
      // Then find model
      for (const [brandName, models] of Object.entries(INDIAN_CAR_MODELS)) {
        for (const m of models) {
          if (markdown.toLowerCase().includes(m.toLowerCase())) {
            model = m;
            if (!brand) brand = brandName;
            break;
          }
        }
        if (model) break;
      }
    }

    if (!brand && !model) return null;

    // Extract fuel type
    let fuel_type = 'Petrol';
    if (/diesel/i.test(markdown)) fuel_type = 'Diesel';
    else if (/electric|ev\b|bev\b/i.test(markdown)) fuel_type = 'Electric';
    else if (/cng/i.test(markdown)) fuel_type = 'CNG';
    else if (/hybrid/i.test(markdown)) fuel_type = 'Hybrid';

    // Extract body type
    let body_type = null;
    if (/compact\s*suv|sub[\s-]*4m\s*suv/i.test(markdown)) body_type = 'Compact SUV';
    else if (/mid[\s-]*size\s*suv/i.test(markdown)) body_type = 'Mid-Size SUV';
    else if (/premium\s*suv|full[\s-]*size\s*suv/i.test(markdown)) body_type = 'Premium SUV';
    else if (/suv/i.test(markdown)) body_type = 'SUV';
    else if (/sedan/i.test(markdown)) body_type = 'Sedan';
    else if (/hatchback/i.test(markdown)) body_type = 'Hatchback';
    else if (/mpv|muv/i.test(markdown)) body_type = 'MPV';

    // Extract transmission
    let transmission = null;
    if (/automatic|at\b|dct|cvt/i.test(markdown)) transmission = 'Automatic';
    else if (/manual|mt\b/i.test(markdown)) transmission = 'Manual';
    else if (/amt|ags/i.test(markdown)) transmission = 'AMT';

    // Extract mileage
    let mileage = null;
    const mileageMatch = markdown.match(/([\d.]+)\s*km\/?l/i);
    if (mileageMatch) {
      mileage = mileageMatch[1];
    }

    // Extract engine CC
    let engine_cc = null;
    const engineMatch = markdown.match(/([\d,]+)\s*cc/i);
    if (engineMatch) {
      engine_cc = parseInt(engineMatch[1].replace(/,/g, ''));
    }

    const image_urls = extractImageUrls(markdown, brand, model);
    const image_url = image_urls[0] || null;

    // Determine source
    let source = 'Web';
    if (url.includes('carwale')) source = 'CarWale';
    else if (url.includes('cars24')) source = 'Cars24';
    else if (url.includes('spinny')) source = 'Spinny';
    else if (url.includes('cardekho')) source = 'CarDekho';
    else if (url.includes('carandbike')) source = 'CarAndBike';
    else if (url.includes('zigwheels')) source = 'ZigWheels';
    else if (url.includes('autoportal')) source = 'AutoPortal';

    return {
      brand,
      model,
      variant: null,
      year: new Date().getFullYear(),
      fuel_type,
      body_type,
      transmission,
      mileage,
      engine_cc,
      ex_showroom_price: price > 0 ? Math.round(price) : null,
      image_url,
      image_urls,
      source,
      source_url: url,
    };
  } catch (e) {
    console.error('Parse error:', e);
    return null;
  }
}
