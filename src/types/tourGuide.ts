export type TransitVehicleMode =
  | 'bus-ac'
  | 'bus-non-ac'
  | 'train'
  | 'flight'
  | 'chander-gari'
  | 'boat'
  | 'ship'
  | 'cng'
  | 'walk'
  | 'convoy';

export interface GuideOrigin {
  id: string;
  name: string;
  district: string;
  coordinates: [number, number]; // [lat, lng]
  departureHubs: string[];
}

export interface GuideDestination {
  id: string;
  name: string;
  tagline: string;
  region: string;
  category: string;
  heroImage: string;
  coordinates: [number, number]; // [lat, lng]
  packageSlug?: string;
  overview: string;
  highlights: string[];
}

export interface RouteWaypoint {
  id: string;
  name: string;
  type: 'origin' | 'transit_hub' | 'convoy_checkpoint' | 'ferry_ghat' | 'destination';
  lat: number;
  lng: number;
  badge?: string;
  description: string;
  stayTime?: string;
  transitToNext?: {
    mode: TransitVehicleMode;
    vehicleName: string;
    duration: string;
    distanceKm: number;
    fareRange: string;
    advice: string;
  };
}

export interface TransitStep {
  stepNumber: number;
  title: string;
  mode: TransitVehicleMode;
  from: string;
  to: string;
  duration: string;
  distanceKm?: number;
  costEstimate: {
    budget: number;
    standard: number;
    luxury?: number;
  };
  timingNotes?: string;
  countersOrStations: string[];
  instructions: string[];
  warnings?: string;
}

export interface TransitOption {
  name: string;
  mode: TransitVehicleMode;
  operatorExamples: string[];
  ticketPriceRange: string;
  travelTime: string;
  schedule: string;
  pros: string[];
  cons: string[];
  recommendedFor: string;
}

export interface CostCategory {
  id: string;
  name: string;
  iconName: string;
  budget: number;
  standard: number;
  luxury: number;
  unit: 'per_person' | 'per_group';
  maxGroupSize?: number; // e.g. 8 for Chander Gari
  notes: string;
}

export interface TravelIntel {
  bestTimeToVisit: string;
  peakSeason: string;
  offSeason: string;
  networkCoverage: {
    teletalk: string;
    robi: string;
    grameenphone: string;
    banglalink: string;
  };
  atmStatus: string;
  permitsAndNid: string[];
  safetyTips: string[];
  packingList: string[];
  localDelicacies: {
    name: string;
    desc: string;
    approxPrice: string;
  }[];
}

export interface TourRouteGuide {
  id: string;
  originId: string;
  destinationId: string;
  routeTitle: string;
  routeSummary: string;
  totalDistanceKm: number;
  totalDurationHours: string;
  googleMapsQuery: string;
  recommendedDays: number;
  waypoints: RouteWaypoint[];
  transitSteps: TransitStep[];
  transitOptions: TransitOption[];
  costCategories: CostCategory[];
  travelIntel: TravelIntel;
  faqs: {
    question: string;
    answer: string;
  }[];
}
