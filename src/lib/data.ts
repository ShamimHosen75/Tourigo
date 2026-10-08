import { cache } from 'react';
import { getSupabase } from './supabase';
import type { Batch, BlogPost, Category, Faq, GalleryItem, Package, Testimonial } from './types';
import { categories as demoCategories } from '@/data/categories';
import { packages as demoPackages } from '@/data/packages';
import { blogPosts as demoBlogs, faqs as demoFaqs, galleryItems as demoGallery, testimonials as demoTestimonials } from '@/data/content';

// Every read goes through here. With Supabase configured the tables in
// supabase/schema.sql are used; otherwise the demo data in src/data is served,
// so the site always renders. If a query fails we log it and fall back too.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

async function fromDb<T>(label: string, run: () => PromiseLike<{ data: Row[] | null; error: unknown }>, map: (r: Row) => T): Promise<T[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  let data: Row[] | null = null;
  let error: unknown = null;
  try {
    ({ data, error } = await run());
  } catch (e) {
    error = e;
  }
  if (error) {
    console.error(`[supabase] ${label} failed, using demo data:`, error);
    return null;
  }
  return (data ?? []).map(map);
}

const mapCategory = (r: Row): Category => ({
  slug: r.slug,
  title: r.title,
  displayTitle: r.display_title ?? r.title.toUpperCase(),
  description: r.description ?? '',
  image: r.image_url ?? undefined,
  scene: r.scene ?? 'hills',
  sortOrder: r.sort_order ?? 0,
});

const mapBatch = (r: Row): Batch => ({
  id: r.id,
  startDate: r.start_date,
  endDate: r.end_date,
  price: Number(r.price),
  seatsTotal: r.seats_total,
  seatsLeft: r.seats_left,
});

const mapPackage = (r: Row): Package => ({
  slug: r.slug,
  title: r.title,
  tagline: r.tagline ?? undefined,
  categorySlug: r.category_slug,
  region: r.region ?? '',
  level: r.level,
  durationDays: r.duration_days,
  durationNights: r.duration_nights,
  altitude: r.altitude ?? undefined,
  ageGroup: r.age_group ?? 'Open for all',
  gender: r.gender ?? 'Both',
  price: Number(r.price),
  originalPrice: Number(r.original_price ?? r.price),
  shortDescription: r.short_description ?? '',
  overview: r.overview ?? [],
  highlights: r.highlights ?? [],
  images: r.images ?? [],
  scene: r.scene ?? 'hills',
  inclusions: r.inclusions ?? [],
  exclusions: r.exclusions ?? [],
  thingsToCarry: r.things_to_carry ?? [],
  itinerary: r.itinerary ?? [],
  batches: ((r.package_batches ?? []) as Row[]).map(mapBatch).sort((a, b) => a.startDate.localeCompare(b.startDate)),
  pickupPoints: r.pickup_points ?? [],
  faqs: r.faqs ?? [],
  policies: r.policies ?? [],
  mapQuery: r.map_query ?? r.title,
  featured: Boolean(r.featured),
  sortOrder: r.sort_order ?? 0,
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const rows = await fromDb('categories', () => getSupabase()!.from('categories').select('*').order('sort_order'), mapCategory);
  return rows ?? demoCategories;
});

export const getPackages = cache(async (): Promise<Package[]> => {
  const rows = await fromDb(
    'packages',
    () => getSupabase()!.from('packages').select('*, package_batches(*)').eq('is_published', true).order('sort_order'),
    mapPackage,
  );
  return rows ?? demoPackages;
});

export async function getPackage(slug: string) {
  return (await getPackages()).find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedPackages() {
  return (await getPackages()).filter((p) => p.featured);
}

export async function getCategoryCounts() {
  const counts: Record<string, number> = {};
  for (const p of await getPackages()) counts[p.categorySlug] = (counts[p.categorySlug] ?? 0) + 1;
  return counts;
}

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const rows = await fromDb(
    'testimonials',
    () => getSupabase()!.from('testimonials').select('*').eq('is_published', true).order('created_at', { ascending: false }),
    (r): Testimonial => ({ id: r.id, name: r.name, trip: r.trip ?? '', rating: r.rating ?? 5, quote: r.quote, avatar: r.avatar_url ?? undefined }),
  );
  return rows ?? demoTestimonials;
});

export const getFaqs = cache(async (): Promise<Faq[]> => {
  const rows = await fromDb(
    'faqs',
    () => getSupabase()!.from('faqs').select('*').order('sort_order'),
    (r): Faq => ({ id: r.id, question: r.question, answer: r.answer, category: r.category }),
  );
  return rows ?? demoFaqs;
});

export const getGallery = cache(async (): Promise<GalleryItem[]> => {
  const rows = await fromDb(
    'gallery_items',
    () => getSupabase()!.from('gallery_items').select('*').order('sort_order'),
    (r): GalleryItem => ({ id: r.id, title: r.title, location: r.location ?? '', image: r.image_url ?? undefined, scene: r.scene ?? 'hills' }),
  );
  return rows ?? demoGallery;
});

const mapBlog = (r: Row): BlogPost => ({
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt ?? '',
  body: r.body ?? [],
  author: r.author ?? '',
  publishedAt: r.published_at,
  readMinutes: r.read_minutes ?? 5,
  tags: r.tags ?? [],
  image: r.image_url ?? undefined,
  scene: r.scene ?? 'hills',
});

export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const rows = await fromDb(
    'blog_posts',
    () => getSupabase()!.from('blog_posts').select('*').eq('is_published', true).order('published_at', { ascending: false }),
    mapBlog,
  );
  return rows ?? demoBlogs;
});

export async function getBlogPost(slug: string) {
  return (await getBlogPosts()).find((b) => b.slug === slug) ?? null;
}
