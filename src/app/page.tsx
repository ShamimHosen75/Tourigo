import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { PopularPackages } from '@/components/home/PopularPackages';
import { GallerySection } from '@/components/home/GallerySection';
import { Testimonials } from '@/components/home/Testimonials';
import { FaqSection } from '@/components/home/FaqSection';
import { getCategories, getCategoryCounts, getFaqs, getFeaturedPackages, getGallery, getTestimonials } from '@/lib/data';
import { toCard } from '@/lib/cards';

export const revalidate = 60;

export default async function HomePage() {
  const [categories, counts, featured, gallery, testimonials, faqs] = await Promise.all([getCategories(), getCategoryCounts(), getFeaturedPackages(), getGallery(), getTestimonials(), getFaqs()]);
  return (
    <>
      <Hero />
      <Categories categories={categories} counts={counts} />
      <PopularPackages packages={featured.map(toCard)} destinations={gallery.length} />
      <GallerySection items={gallery} />
      <Testimonials items={testimonials} />
      <FaqSection faqs={faqs} />
    </>
  );
}
