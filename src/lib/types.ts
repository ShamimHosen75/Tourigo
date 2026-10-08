// Shapes shared by the demo data (src/data) and the Supabase tables (supabase/schema.sql).
// Column names in the database are snake_case; src/lib/data.ts maps them to these.

/** Built-in artwork used when a record has no photo URL yet. */
export type SceneKind =
  | 'hills'
  | 'beach'
  | 'island'
  | 'waterfall'
  | 'forest'
  | 'mangrove'
  | 'tea'
  | 'lake'
  | 'haor'
  | 'heritage'
  | 'city'
  | 'snow';

export type Level = 'Beginner' | 'Moderate' | 'Challenging';

export interface Category {
  slug: string;
  title: string;
  displayTitle: string; // big poster word(s) printed on the card
  description: string;
  image?: string;
  scene: SceneKind;
  sortOrder: number;
}

export interface Batch {
  id: string;
  startDate: string; // ISO date
  endDate: string;
  price: number;
  seatsTotal: number;
  seatsLeft: number;
}

export interface PickupPoint {
  id: string;
  name: string;
  detail: string;
  time: string;
  extraFee: number;
  mapUrl?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  summary?: string;
  items: { time?: string; text: string }[];
  meals?: string;
  stay?: string;
  duration?: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Booking' | 'Safety' | 'Gear' | 'Cancellation';
}

export interface Package {
  slug: string;
  title: string;
  tagline?: string;
  categorySlug: string;
  region: string;
  level: Level;
  durationDays: number;
  durationNights: number;
  altitude?: string;
  ageGroup: string;
  gender: string;
  price: number;
  originalPrice: number;
  shortDescription: string;
  overview: string[];
  highlights: string[];
  images: string[];
  scene: SceneKind;
  inclusions: string[];
  exclusions: string[];
  thingsToCarry: string[];
  itinerary: ItineraryDay[];
  batches: Batch[];
  pickupPoints: PickupPoint[];
  faqs: { question: string; answer: string }[];
  policies: { title: string; body: string }[];
  mapQuery: string;
  featured: boolean;
  sortOrder: number;
}

export interface Testimonial {
  id: string;
  name: string;
  trip: string;
  rating: number;
  quote: string;
  avatar?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  location: string;
  image?: string;
  scene: SceneKind;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  author: string;
  publishedAt: string;
  readMinutes: number;
  tags: string[];
  image?: string;
  scene: SceneKind;
}

export interface BookingInput {
  packageSlug: string;
  packageTitle: string;
  batchId: string;
  batchLabel: string;
  travelers: number;
  pickupPointId: string;
  pickupPointName: string;
  totalAmount: number;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface EnquiryInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}
