import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CardPackage } from '@/components/packages/PackageFlipCard';
import { PackageFlipCard } from '@/components/packages/PackageFlipCard';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Reveal } from '@/components/ui/Reveal';
import { StatRow } from '@/components/ui/CountUp';

export function PopularPackages({ packages, destinations }: { packages: CardPackage[]; destinations: number }) {
  return (
    <section className="py-20">
      <div className="container">
        <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <SectionBadge>Featured Adventures</SectionBadge>
            <h2 className="section-title mt-4">
              Discover Popular <span className="accent">Treks &amp; Tour Packages</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-mute">Handpicked trekking experiences, weekend getaways, camping adventures and island escapes designed for explorers of every skill level.</p>
          </div>
          <StatRow
            stats={[
              { value: packages.length, suffix: '+', label: 'Popular Packages' },
              { value: destinations, suffix: '+', label: 'Destinations' },
              { value: 100, suffix: '%', label: 'Satisfaction Guarantee' },
            ]}
          />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 0.08}>
              <PackageFlipCard pkg={p} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/packages" className="btn-ghost">
            View all packages <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
