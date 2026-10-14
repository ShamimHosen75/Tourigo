import { Move3D } from 'lucide-react';
import type { GalleryItem } from '@/lib/types';
import { siteConfig } from '@/config/site';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Reveal } from '@/components/ui/Reveal';
import { StatRow } from '@/components/ui/CountUp';
import { DomeGallery } from './DomeGallery';

export function GallerySection({ items }: { items: GalleryItem[] }) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28 bg-white">
      {/* ambient glows */}
      <div className="pointer-events-none absolute top-10 right-10 h-80 w-80 rounded-full bg-brand-100/30 blur-3xl" />

      <div className="container relative">
        <Reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <SectionBadge>Adventure Gallery</SectionBadge>
            <h2 className="section-title mt-4">
              Moments That Inspire <span className="accent">Every Adventure</span>
            </h2>
            <p className="mt-3.5 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600">
              Breathtaking beaches, misty hills, waterfalls and forests — the most loved spots of Bangladesh, captured by travellers who chose {siteConfig.name}.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-700">
              <Move3D className="h-3.5 w-3.5 text-brand-500" />
              <span>Interactive 3D Dome • Drag &amp; Rotate</span>
            </div>
          </div>
          <div className="w-full lg:w-auto">
            <StatRow
              stats={[
                { value: 10000, suffix: '+', label: 'Happy Travelers' },
                { value: 500, suffix: '+', label: 'Trips Organized' },
                { value: items.length, suffix: '+', label: 'Destinations' },
              ]}
            />
          </div>
        </Reveal>
      </div>
      <Reveal y={60} className="mt-10">
        <DomeGallery items={items} />
      </Reveal>
    </section>
  );
}
