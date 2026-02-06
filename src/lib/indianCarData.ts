// Indian Car Market Data

export interface Car {
  id: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  exShowroomPrice: number;
  onRoadPrice: number;
  mileage: number;
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
  engineCC: number;
  transmission: 'Manual' | 'Automatic' | 'AMT' | 'CVT' | 'DCT';
  bodyType: 'Hatchback' | 'Compact SUV' | 'Mid-Size SUV' | 'Premium SUV' | 'Sedan' | 'MPV' | 'Electric';
  condition: 'New' | 'Excellent' | 'Good' | 'Fair';
  seatingCapacity: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  rating: number;
  launchYear: number;
  kmDriven?: number;
}

export interface Auction {
  id: string;
  car: Car;
  startingPrice: number;
  currentBid: number;
  bidCount: number;
  endTime: Date;
  isLive: boolean;
  highestBidder?: string;
  registrationState?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Indian Car Categories
export const categories: Category[] = [
  { id: 'hatchback', name: 'Hatchbacks', description: 'Compact & fuel-efficient city cars', icon: '🚗' },
  { id: 'compact-suv', name: 'Compact SUVs', description: 'Sub-4m SUVs with great features', icon: '🚙' },
  { id: 'mid-suv', name: 'Mid-Size SUVs', description: 'Spacious family SUVs', icon: '🚐' },
  { id: 'premium-suv', name: 'Premium SUVs', description: 'Luxury & powerful SUVs', icon: '🏎️' },
  { id: 'sedan', name: 'Sedans', description: 'Elegant & comfortable cars', icon: '🚘' },
  { id: 'electric', name: 'Electric Vehicles', description: 'Eco-friendly EVs', icon: '⚡' },
];

// Indian Car Brands
export const indianBrands = [
  'All',
  'Maruti Suzuki',
  'Tata Motors',
  'Mahindra',
  'Hyundai',
  'Kia',
  'Honda',
  'Toyota',
  'Renault',
  'Skoda',
  'Volkswagen',
  'MG',
];

export const fuelTypes = ['All', 'Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

export const bodyTypes = ['All', 'Hatchback', 'Compact SUV', 'Mid-Size SUV', 'Premium SUV', 'Sedan', 'MPV', 'Electric'];

export const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under ₹5 Lakh', min: 0, max: 500000 },
  { label: '₹5-10 Lakh', min: 500000, max: 1000000 },
  { label: '₹10-15 Lakh', min: 1000000, max: 1500000 },
  { label: '₹15-25 Lakh', min: 1500000, max: 2500000 },
  { label: 'Above ₹25 Lakh', min: 2500000, max: Infinity },
];

// Indian States for Registration
export const indianStates = [
  { code: 'DL', name: 'Delhi' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'WB', name: 'West Bengal' },
  { code: 'HR', name: 'Haryana' },
  { code: 'PB', name: 'Punjab' },
  { code: 'KL', name: 'Kerala' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'TS', name: 'Telangana' },
  { code: 'MP', name: 'Madhya Pradesh' },
];

// Mock Indian Cars Data
export const cars: Car[] = [
  // Maruti Suzuki
  {
    id: '1',
    brand: 'Maruti Suzuki',
    model: 'Swift',
    variant: 'ZXi+ AGS',
    year: 2024,
    exShowroomPrice: 899000,
    onRoadPrice: 1050000,
    mileage: 22.56,
    fuelType: 'Petrol',
    engineCC: 1197,
    transmission: 'AMT',
    bodyType: 'Hatchback',
    condition: 'New',
    seatingCapacity: 5,
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
    images: ['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800'],
    description: 'The all-new Maruti Suzuki Swift with refreshed design, powerful engine, and best-in-class mileage.',
    features: ['SmartPlay Pro+', 'Cruise Control', 'LED Headlamps', 'Wireless Charging', 'Auto AC'],
    rating: 4.3,
    launchYear: 2024,
  },
  {
    id: '2',
    brand: 'Maruti Suzuki',
    model: 'Brezza',
    variant: 'ZXi+ AT',
    year: 2024,
    exShowroomPrice: 1399000,
    onRoadPrice: 1620000,
    mileage: 19.8,
    fuelType: 'Petrol',
    engineCC: 1462,
    transmission: 'Automatic',
    bodyType: 'Compact SUV',
    condition: 'New',
    seatingCapacity: 5,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',
    images: ['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800'],
    description: 'Maruti Suzuki Brezza - India\'s favorite compact SUV with bold design and premium features.',
    features: ['Sunroof', 'Head-Up Display', '360° Camera', 'Wireless CarPlay', 'Connected Car Tech'],
    rating: 4.4,
    launchYear: 2024,
  },
  // Tata Motors
  {
    id: '3',
    brand: 'Tata Motors',
    model: 'Nexon',
    variant: 'Creative+ S',
    year: 2024,
    exShowroomPrice: 1249900,
    onRoadPrice: 1450000,
    mileage: 17.4,
    fuelType: 'Petrol',
    engineCC: 1199,
    transmission: 'AMT',
    bodyType: 'Compact SUV',
    condition: 'New',
    seatingCapacity: 5,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    images: ['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800'],
    description: 'Tata Nexon - 5-Star GNCAP safety rated SUV with stunning design and powerful performance.',
    features: ['Ventilated Seats', 'JBL Sound System', 'iRA Connected Tech', 'Air Purifier', 'Sunroof'],
    rating: 4.5,
    launchYear: 2024,
  },
  {
    id: '4',
    brand: 'Tata Motors',
    model: 'Punch',
    variant: 'Creative+ AMT',
    year: 2024,
    exShowroomPrice: 849000,
    onRoadPrice: 980000,
    mileage: 18.8,
    fuelType: 'Petrol',
    engineCC: 1199,
    transmission: 'AMT',
    bodyType: 'Compact SUV',
    condition: 'New',
    seatingCapacity: 5,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'],
    description: 'Tata Punch - The stylish micro-SUV with 5-star safety and rugged design.',
    features: ['Terrain Response Modes', 'Semi-Digital Cluster', 'Harman Audio', 'Rain Sensing Wipers'],
    rating: 4.4,
    launchYear: 2024,
  },
  {
    id: '5',
    brand: 'Tata Motors',
    model: 'Safari',
    variant: 'Accomplished+ AT',
    year: 2024,
    exShowroomPrice: 2549000,
    onRoadPrice: 2920000,
    mileage: 14.5,
    fuelType: 'Diesel',
    engineCC: 1956,
    transmission: 'Automatic',
    bodyType: 'Premium SUV',
    condition: 'New',
    seatingCapacity: 7,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'],
    description: 'Tata Safari - The iconic SUV reborn with premium interiors and commanding presence.',
    features: ['Panoramic Sunroof', 'ADAS', 'Ventilated Front Seats', 'Boss Mode', 'JBL 9-Speaker System'],
    rating: 4.3,
    launchYear: 2024,
  },
  {
    id: '6',
    brand: 'Tata Motors',
    model: 'Nexon EV',
    variant: 'Empowered+ LR',
    year: 2024,
    exShowroomPrice: 1849900,
    onRoadPrice: 1950000,
    mileage: 465,
    fuelType: 'Electric',
    engineCC: 0,
    transmission: 'Automatic',
    bodyType: 'Electric',
    condition: 'New',
    seatingCapacity: 5,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800'],
    description: 'Tata Nexon EV - India\'s best-selling electric SUV with 465km range.',
    features: ['Fast Charging', 'V2L', 'Connected Car', 'Regenerative Braking', 'Multi-Mode Regen'],
    rating: 4.5,
    launchYear: 2024,
  },
  // Mahindra
  {
    id: '7',
    brand: 'Mahindra',
    model: 'XUV 7OO',
    variant: 'AX7 L AT',
    year: 2024,
    exShowroomPrice: 2449000,
    onRoadPrice: 2850000,
    mileage: 13.2,
    fuelType: 'Diesel',
    engineCC: 2184,
    transmission: 'Automatic',
    bodyType: 'Premium SUV',
    condition: 'New',
    seatingCapacity: 7,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',
    images: ['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800'],
    description: 'Mahindra XUV700 - The sophisticated SUV with world-class features and ADAS.',
    features: ['ADAS Level 2', 'Panoramic Sunroof', 'Sony 3D Sound', 'AdrenoX Connect', 'Alexa Built-in'],
    rating: 4.6,
    launchYear: 2024,
  },
  {
    id: '8',
    brand: 'Mahindra',
    model: 'Scorpio-N',
    variant: 'Z8 L AT',
    year: 2024,
    exShowroomPrice: 2349000,
    onRoadPrice: 2720000,
    mileage: 11.9,
    fuelType: 'Diesel',
    engineCC: 2184,
    transmission: 'Automatic',
    bodyType: 'Premium SUV',
    condition: 'New',
    seatingCapacity: 7,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'],
    description: 'Mahindra Scorpio-N - The Big Daddy of SUVs with powerful performance.',
    features: ['4x4', 'Terrain Modes', 'Sony Sound System', 'Dual Zone AC', 'Connected Car'],
    rating: 4.4,
    launchYear: 2024,
  },
  {
    id: '9',
    brand: 'Mahindra',
    model: 'Thar',
    variant: 'LX 4-STR AT',
    year: 2024,
    exShowroomPrice: 1799000,
    onRoadPrice: 2050000,
    mileage: 11.5,
    fuelType: 'Diesel',
    engineCC: 2184,
    transmission: 'Automatic',
    bodyType: 'Compact SUV',
    condition: 'New',
    seatingCapacity: 4,
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
    images: ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'],
    description: 'Mahindra Thar - The iconic off-roader that rules every terrain.',
    features: ['4x4', 'Convertible Top', 'Touchscreen', 'Adventure Statistics', 'Cruise Control'],
    rating: 4.5,
    launchYear: 2024,
  },
  // Hyundai
  {
    id: '10',
    brand: 'Hyundai',
    model: 'Creta',
    variant: 'SX(O) DCT',
    year: 2024,
    exShowroomPrice: 1999000,
    onRoadPrice: 2320000,
    mileage: 16.8,
    fuelType: 'Petrol',
    engineCC: 1497,
    transmission: 'DCT',
    bodyType: 'Mid-Size SUV',
    condition: 'New',
    seatingCapacity: 5,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'],
    description: 'Hyundai Creta - India\'s most loved SUV with premium features and stunning design.',
    features: ['Panoramic Sunroof', 'ADAS Level 2', 'Bose Sound', 'Ventilated Seats', 'BlueLink Connected'],
    rating: 4.5,
    launchYear: 2024,
  },
  {
    id: '11',
    brand: 'Hyundai',
    model: 'i20',
    variant: 'Asta(O) DCT',
    year: 2024,
    exShowroomPrice: 1199000,
    onRoadPrice: 1380000,
    mileage: 18.6,
    fuelType: 'Petrol',
    engineCC: 998,
    transmission: 'DCT',
    bodyType: 'Hatchback',
    condition: 'New',
    seatingCapacity: 5,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
    description: 'Hyundai i20 - The sporty premium hatchback with cutting-edge technology.',
    features: ['Sunroof', 'Bose Audio', 'Wireless CarPlay', 'BlueLink', 'Digital Cluster'],
    rating: 4.4,
    launchYear: 2024,
  },
  // Kia
  {
    id: '12',
    brand: 'Kia',
    model: 'Seltos',
    variant: 'GTX+ DCT',
    year: 2024,
    exShowroomPrice: 1999000,
    onRoadPrice: 2290000,
    mileage: 16.5,
    fuelType: 'Petrol',
    engineCC: 1497,
    transmission: 'DCT',
    bodyType: 'Mid-Size SUV',
    condition: 'New',
    seatingCapacity: 5,
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800',
    images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800'],
    description: 'Kia Seltos - The badass SUV with stunning looks and advanced technology.',
    features: ['Panoramic Sunroof', 'ADAS', 'Bose Sound', 'Ventilated Seats', 'Kia Connect'],
    rating: 4.5,
    launchYear: 2024,
  },
  {
    id: '13',
    brand: 'Kia',
    model: 'Sonet',
    variant: 'GTX+ DCT',
    year: 2024,
    exShowroomPrice: 1549000,
    onRoadPrice: 1790000,
    mileage: 18.2,
    fuelType: 'Petrol',
    engineCC: 998,
    transmission: 'DCT',
    bodyType: 'Compact SUV',
    condition: 'New',
    seatingCapacity: 5,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',
    images: ['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800'],
    description: 'Kia Sonet - The wild compact SUV with segment-first features.',
    features: ['Sunroof', 'Bose Audio', 'Ventilated Seats', 'Air Purifier', 'Kia Connect'],
    rating: 4.4,
    launchYear: 2024,
  },
  // Honda
  {
    id: '14',
    brand: 'Honda',
    model: 'City',
    variant: 'ZX CVT',
    year: 2024,
    exShowroomPrice: 1649000,
    onRoadPrice: 1920000,
    mileage: 18.4,
    fuelType: 'Petrol',
    engineCC: 1498,
    transmission: 'CVT',
    bodyType: 'Sedan',
    condition: 'New',
    seatingCapacity: 5,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'],
    description: 'Honda City - The legendary sedan known for reliability and comfort.',
    features: ['Sunroof', 'Honda Connect', 'LaneWatch Camera', 'LED Headlamps', 'ADAS'],
    rating: 4.4,
    launchYear: 2024,
  },
  {
    id: '15',
    brand: 'Honda',
    model: 'Elevate',
    variant: 'ZX CVT',
    year: 2024,
    exShowroomPrice: 1699000,
    onRoadPrice: 1980000,
    mileage: 15.3,
    fuelType: 'Petrol',
    engineCC: 1498,
    transmission: 'CVT',
    bodyType: 'Mid-Size SUV',
    condition: 'New',
    seatingCapacity: 5,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    images: ['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800'],
    description: 'Honda Elevate - Honda\'s first mid-size SUV for India with premium features.',
    features: ['ADAS Level 2', 'Sunroof', 'Wireless CarPlay', 'Honda Connect', 'Lane Keep Assist'],
    rating: 4.3,
    launchYear: 2024,
  },
  // MG Electric
  {
    id: '16',
    brand: 'MG',
    model: 'ZS EV',
    variant: 'Exclusive Pro',
    year: 2024,
    exShowroomPrice: 2499000,
    onRoadPrice: 2650000,
    mileage: 461,
    fuelType: 'Electric',
    engineCC: 0,
    transmission: 'Automatic',
    bodyType: 'Electric',
    condition: 'New',
    seatingCapacity: 5,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800'],
    description: 'MG ZS EV - Premium electric SUV with impressive range and features.',
    features: ['Fast Charging', 'Panoramic Sunroof', 'i-SMART', 'PM2.5 Filter', 'Connected Car'],
    rating: 4.2,
    launchYear: 2024,
  },
];

// Mock Auctions
export const auctions: Auction[] = [
  {
    id: 'a1',
    car: {
      ...cars[8], // Thar
      id: 'a1-car',
      condition: 'Excellent',
      kmDriven: 12000,
    },
    startingPrice: 1400000,
    currentBid: 1520000,
    bidCount: 18,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    isLive: true,
    highestBidder: 'Rajesh K.',
    registrationState: 'MH',
  },
  {
    id: 'a2',
    car: {
      ...cars[9], // Creta
      id: 'a2-car',
      condition: 'Excellent',
      kmDriven: 8500,
    },
    startingPrice: 1600000,
    currentBid: 1725000,
    bidCount: 12,
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
    isLive: true,
    highestBidder: 'Priya S.',
    registrationState: 'DL',
  },
  {
    id: 'a3',
    car: {
      ...cars[6], // XUV700
      id: 'a3-car',
      condition: 'Good',
      kmDriven: 25000,
    },
    startingPrice: 2000000,
    currentBid: 2150000,
    bidCount: 8,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isLive: false,
    highestBidder: 'Amit V.',
    registrationState: 'KA',
  },
];

// Format INR currency
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format price in Lakhs
export const formatLakhs = (amount: number): string => {
  const lakhs = amount / 100000;
  if (lakhs >= 100) {
    return `₹${(lakhs / 100).toFixed(2)} Cr`;
  }
  return `₹${lakhs.toFixed(2)} Lakh`;
};

// Get cars by category
export const getCarsByCategory = (categoryId: string): Car[] => {
  const categoryMap: Record<string, string[]> = {
    'hatchback': ['Hatchback'],
    'compact-suv': ['Compact SUV'],
    'mid-suv': ['Mid-Size SUV'],
    'premium-suv': ['Premium SUV'],
    'sedan': ['Sedan'],
    'electric': ['Electric'],
  };
  
  const bodyTypes = categoryMap[categoryId];
  if (!bodyTypes) return cars;
  
  return cars.filter((car) => bodyTypes.includes(car.bodyType));
};
