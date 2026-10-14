import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CardPackage } from '@/components/packages/PackageFlipCard';
import { PackageFlipCard } from '@/components/packages/PackageFlipCard';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Reveal } from '@/components/ui/Reveal';
import { StatRow } from '@/components/ui/CountUp';

export function PopularPackages({ packages, destinations }: { packages: CardPackage[]; destinations: number }) {
  return (
    <section className="relative py-24 sm:py-28 overflow-hidden bg-gradient-to-b from-paper via-white to-paper/50">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-28 h-96 w-96 rounded-full bg-cyan-100/40 blur-3xl" />

      <div className="container relative">
        <Reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <SectionBadge>Featured Adventures</SectionBadge>
            <h2 className="section-title mt-4">
              Discover Popular <span className="accent">Treks &amp; Tour Packages</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600">
              Handpicked trekking experiences, weekend getaways, camping adventures and island escapes designed for explorers of every skill level.
            </p>
          </div>
          <div className="w-full lg:w-auto">
            <StatRow
              stats={[
                { value: packages.length, suffix: '+', label: 'Popular Packages' },
                { value: destinations, suffix: '+', label: 'Destinations' },
                { value: 100, suffix: '%', label: 'Satisfaction' },
              ]}
            />
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 0.08}>
              <PackageFlipCard pkg={p} />
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/packages" className="btn-ghost group text-sm sm:text-base px-7 py-3.5 shadow-sm hover:shadow-lg">
            <span>Explore all packages</span>
            <ArrowRight className="h-4 w-4 text-brand-500 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

