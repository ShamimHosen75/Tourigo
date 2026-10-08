import type { GalleryItem } from '@/lib/types';
import { siteConfig } from '@/config/site';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Reveal } from '@/components/ui/Reveal';
import { StatRow } from '@/components/ui/CountUp';
import { DomeGallery } from './DomeGallery';

export function GallerySection({ items }: { items: GalleryItem[] }) {
  return (
    <section className="overflow-hidden py-20">
      <div className="container">
        <Reveal>
          <SectionBadge>Adventure Gallery</SectionBadge>
          <h2 className="section-title mt-4">
            Moments That Inspire <span className="accent">Every Adventure</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-mute">
            Breathtaking beaches, misty hills, waterfalls and forests — the most loved spots of Bangladesh, captured by travellers who chose {siteConfig.name}. Drag the sphere to explore.
          </p>
          <div className="mt-5">
            <StatRow
              stats={[
                { value: 10000, suffix: '+', label: 'Happy Travelers' },
                { value: 500, suffix: '+', label: 'Adventure Trips' },
                { value: items.length, suffix: '+', label: 'Destinations' },
              ]}
            />
          </div>
        </Reveal>
      </div>
      <Reveal y={60} className="mt-6">
        <DomeGallery items={items} />
      </Reveal>
    </section>
  );
}
