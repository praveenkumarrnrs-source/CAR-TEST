// Mock data for cars and auctions

export interface Car {
  id: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  engineType: string;
  transmission: 'Automatic' | 'Manual';
  condition: 'Excellent' | 'Good' | 'Fair';
  image: string;
  images: string[];
  description: string;
  features: string[];
  isAuction?: boolean;
  auctionEndTime?: Date;
  currentBid?: number;
  bidCount?: number;
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
}

export const cars: Car[] = [
  {
    id: '1',
    brand: 'Porsche',
    model: '911',
    variant: 'Carrera S',
    year: 2023,
    price: 145000,
    mileage: 5200,
    fuelType: 'Petrol',
    engineType: '3.0L Twin-Turbo Flat-6',
    transmission: 'Automatic',
    condition: 'Excellent',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    ],
    description: 'Stunning Porsche 911 Carrera S in pristine condition. This iconic sports car features the legendary flat-six engine and offers an unparalleled driving experience.',
    features: ['Sport Chrono Package', 'PASM Sport Suspension', 'Bose Surround Sound', 'Adaptive Cruise Control', 'Ceramic Brakes'],
  },
  {
    id: '2',
    brand: 'BMW',
    model: 'M4',
    variant: 'Competition',
    year: 2024,
    price: 89500,
    mileage: 1200,
    fuelType: 'Petrol',
    engineType: '3.0L Twin-Turbo I6',
    transmission: 'Automatic',
    condition: 'Excellent',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    ],
    description: 'Brand new BMW M4 Competition with M xDrive. The ultimate driving machine with track-ready performance.',
    features: ['M xDrive', 'Carbon Fiber Roof', 'M Carbon Bucket Seats', 'Head-Up Display', 'Harman Kardon Audio'],
  },
  {
    id: '3',
    brand: 'Mercedes-Benz',
    model: 'AMG GT',
    variant: '63 S',
    year: 2023,
    price: 175000,
    mileage: 8500,
    fuelType: 'Petrol',
    engineType: '4.0L Twin-Turbo V8',
    transmission: 'Automatic',
    condition: 'Excellent',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    ],
    description: 'Mercedes-AMG GT 63 S - The pinnacle of performance luxury. A handcrafted masterpiece from Affalterbach.',
    features: ['AMG Performance Exhaust', 'AMG Ride Control+', 'Burmester 3D Sound', 'Nappa Leather Interior', 'Night Package'],
  },
  {
    id: '4',
    brand: 'Tesla',
    model: 'Model S',
    variant: 'Plaid',
    year: 2024,
    price: 108000,
    mileage: 3200,
    fuelType: 'Electric',
    engineType: 'Tri Motor Electric',
    transmission: 'Automatic',
    condition: 'Excellent',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    ],
    description: 'Tesla Model S Plaid - The quickest production car ever made. 0-60 in under 2 seconds with 396 miles of range.',
    features: ['Autopilot', 'Full Self-Driving', 'Yoke Steering', 'Gaming Computer', '22-speaker Audio'],
  },
  {
    id: '5',
    brand: 'Audi',
    model: 'RS7',
    variant: 'Sportback',
    year: 2023,
    price: 128000,
    mileage: 12000,
    fuelType: 'Petrol',
    engineType: '4.0L Twin-Turbo V8',
    transmission: 'Automatic',
    condition: 'Good',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    ],
    description: 'Audi RS7 Sportback - Where performance meets practicality. A stunning four-door coupe with supercar performance.',
    features: ['Quattro AWD', 'Matrix LED Headlights', 'Bang & Olufsen 3D', 'RS Sport Suspension', 'Virtual Cockpit Plus'],
  },
  {
    id: '6',
    brand: 'Lamborghini',
    model: 'Huracán',
    variant: 'EVO',
    year: 2022,
    price: 285000,
    mileage: 4800,
    fuelType: 'Petrol',
    engineType: '5.2L V10',
    transmission: 'Automatic',
    condition: 'Excellent',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
    images: [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
    ],
    description: 'Lamborghini Huracán EVO - Pure Italian supercar excellence with a naturally aspirated V10 engine.',
    features: ['LDVI System', 'Magneto Rheological Suspension', 'Sensonum Sound System', 'Rear-Wheel Steering', 'Transparent Engine Cover'],
  },
];

export const auctions: Auction[] = [
  {
    id: 'a1',
    car: {
      ...cars[5],
      id: 'a1-car',
    },
    startingPrice: 250000,
    currentBid: 278000,
    bidCount: 23,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    isLive: true,
    highestBidder: 'John D.',
  },
  {
    id: 'a2',
    car: {
      ...cars[0],
      id: 'a2-car',
    },
    startingPrice: 130000,
    currentBid: 142500,
    bidCount: 15,
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    isLive: true,
    highestBidder: 'Sarah M.',
  },
  {
    id: 'a3',
    car: {
      ...cars[2],
      id: 'a3-car',
    },
    startingPrice: 160000,
    currentBid: 168000,
    bidCount: 8,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    isLive: false,
    highestBidder: 'Michael R.',
  },
];

export const brands = ['All', 'Porsche', 'BMW', 'Mercedes-Benz', 'Tesla', 'Audi', 'Lamborghini', 'Ferrari', 'McLaren'];

export const fuelTypes = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];

export const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under $50,000', min: 0, max: 50000 },
  { label: '$50,000 - $100,000', min: 50000, max: 100000 },
  { label: '$100,000 - $200,000', min: 100000, max: 200000 },
  { label: 'Over $200,000', min: 200000, max: Infinity },
];
