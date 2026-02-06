import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, ArrowRight, Car, Upload, BarChart3, MapPin } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { indianBrands, indianStates, formatLakhs } from '@/lib/indianCarData';

interface ValuationResult {
  estimatedPrice: number;
  minPrice: number;
  maxPrice: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  demandLevel: 'High' | 'Medium' | 'Low';
  sources: string[];
}

interface PlateResult {
  registrationNumber: string;
  registrationState: string;
  brand: string;
  model: string;
  variant: string;
  fuelType: string;
  year: number;
  engineCC: number;
}

const ValuationPage = () => {
  const [plateNumber, setPlateNumber] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null);
  const [plateResult, setPlateResult] = useState<PlateResult | null>(null);

  const handleValuation = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setValuationResult({
      estimatedPrice: 1250000,
      minPrice: 1100000,
      maxPrice: 1400000,
      trend: 'up',
      trendPercentage: 2.5,
      demandLevel: 'High',
      sources: ['CarWale', 'Cars24', 'Spinny', 'OLX Autos'],
    });
    setIsLoading(false);
  };

  const handlePlateLookup = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mock plate lookup result
    setPlateResult({
      registrationNumber: plateNumber.toUpperCase(),
      registrationState: 'Maharashtra',
      brand: 'Hyundai',
      model: 'Creta',
      variant: 'SX(O)',
      fuelType: 'Petrol',
      year: 2022,
      engineCC: 1497,
    });
    
    // Also show valuation
    setValuationResult({
      estimatedPrice: 1520000,
      minPrice: 1400000,
      maxPrice: 1650000,
      trend: 'stable',
      trendPercentage: 0.5,
      demandLevel: 'High',
      sources: ['CarWale', 'Cars24', 'OLX Autos'],
    });
    
    setIsLoading(false);
  };

  const formatPlateInput = (value: string) => {
    // Format Indian number plate: XX 00 XX 0000
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return cleaned.slice(0, 10);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Car Valuation India
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get accurate market valuations in ₹ INR from CarWale, Cars24, Spinny & more trusted Indian sources.
            </p>
          </motion.div>

          {/* Valuation Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="plate" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="plate" className="gap-2">
                      <MapPin className="w-4 h-4" />
                      Number Plate
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="gap-2">
                      <Car className="w-4 h-4" />
                      Manual Entry
                    </TabsTrigger>
                    <TabsTrigger value="image" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="plate">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Vehicle Registration Number</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            className="pl-10 text-lg font-mono tracking-wider"
                            placeholder="MH 02 AB 1234"
                            value={plateNumber}
                            onChange={(e) => setPlateNumber(formatPlateInput(e.target.value))}
                            maxLength={10}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Enter Indian vehicle registration number (e.g., DL, MH, KA, TN)
                        </p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground">
                          🔒 We only fetch publicly available vehicle data. Personal owner details are never displayed (privacy-compliant).
                        </p>
                      </div>
                      <Button 
                        className="w-full h-12 btn-glow" 
                        onClick={handlePlateLookup}
                        disabled={plateNumber.length < 6 || isLoading}
                      >
                        {isLoading ? 'Looking up...' : 'Lookup Vehicle'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="manual">
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Brand</label>
                          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {indianBrands.filter(b => b !== 'All').map((brand) => (
                                <SelectItem key={brand} value={brand}>
                                  {brand}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Model</label>
                          <Input
                            placeholder="e.g., Swift, Creta, Nexon"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Year</label>
                        <Input
                          type="number"
                          placeholder="e.g., 2022"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                        />
                      </div>
                      <Button 
                        className="w-full h-12 btn-glow" 
                        onClick={handleValuation}
                        disabled={!selectedBrand || !model || !year || isLoading}
                      >
                        {isLoading ? 'Analyzing...' : 'Get Valuation'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="image">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">
                          Drag and drop a car image here
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          or click to browse files
                        </p>
                        <Button variant="outline">
                          Choose File
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Our AI will identify Indian car models and provide ₹ INR valuation
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Plate Lookup Result */}
          {plateResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    Vehicle Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Registration</p>
                      <p className="font-mono font-bold text-lg">{plateResult.registrationNumber}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Car</p>
                      <p className="font-semibold">{plateResult.brand} {plateResult.model}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-semibold">{plateResult.year}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">State</p>
                      <p className="font-semibold">{plateResult.registrationState}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Valuation Results */}
          {valuationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Market Valuation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Main Price */}
                    <div className="md:col-span-2 bg-secondary/50 rounded-xl p-6">
                      <p className="text-sm text-muted-foreground mb-2">Estimated Market Value</p>
                      <p className="text-4xl font-display font-bold text-primary mb-4">
                        {formatLakhs(valuationResult.estimatedPrice)}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Range: {formatLakhs(valuationResult.minPrice)} - {formatLakhs(valuationResult.maxPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Trend */}
                    <div className="space-y-4">
                      <div className="bg-secondary/50 rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-2">Price Trend</p>
                        <div className="flex items-center gap-2">
                          {valuationResult.trend === 'up' ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                          ) : valuationResult.trend === 'down' ? (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className={`font-semibold ${
                            valuationResult.trend === 'up' ? 'text-success' : 
                            valuationResult.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                          }`}>
                            {valuationResult.trend === 'up' ? '+' : valuationResult.trend === 'down' ? '-' : ''}{valuationResult.trendPercentage}%
                          </span>
                          <span className="text-muted-foreground text-sm">30 days</span>
                        </div>
                      </div>

                      <div className="bg-secondary/50 rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-2">Market Demand</p>
                        <p className={`font-semibold ${
                          valuationResult.demandLevel === 'High' ? 'text-success' : 
                          valuationResult.demandLevel === 'Medium' ? 'text-accent' : 'text-muted-foreground'
                        }`}>
                          {valuationResult.demandLevel}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sources */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Data sourced from:</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {valuationResult.sources.map((source) => (
                        <Badge key={source} variant="secondary">{source}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      * Valuation based on current Indian market data. Actual prices may vary based on condition, location, and market conditions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ValuationPage;
