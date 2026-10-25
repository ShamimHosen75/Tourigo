'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import type { CardPackage } from '@/components/packages/PackageFlipCard';
import { PackageFlipCard } from '@/components/packages/PackageFlipCard';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Reveal } from '@/components/ui/Reveal';
import { StatRow } from '@/components/ui/CountUp';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type FilterTab = 'all' | 'himalayan' | 'bangladesh';

export function PopularPackages({ packages, destinations }: { packages: CardPackage[]; destinations: number }) {
  const { t, formatNumber } = useLanguage();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const himalayanSlugs = [
    'manali-solang-valley',
    'shimla-kufri',
    'spiti-tirthan-valley',
    'kinnaur-kalpa-sangla',
    'dharamshala-dalhousie',
    'srinagar-kashmir-heaven',
  ];

  const filtered = packages.filter((p) => {
    if (activeTab === 'himalayan') return himalayanSlugs.includes(p.slug);
    if (activeTab === 'bangladesh') return !himalayanSlugs.includes(p.slug);
    return true;
  });

  return (
    <section className="relative py-24 sm:py-28 overflow-hidden bg-gradient-to-b from-paper via-white to-paper/50">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-28 h-96 w-96 rounded-full bg-cyan-100/40 blur-3xl" />

      <div className="container relative">
        <Reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <SectionBadge>
              {t('popularPackages.badge', 'Famous & Popular Destinations')}
            </SectionBadge>
            <h2 className="section-title mt-4">
              {t('popularPackages.title', 'Explore Our Most')}{' '}
              <span className="accent">
                {t('popularPackages.titleAccent', 'Iconic & Popular Places')}
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600">
              {t(
                'popularPackages.description',
                'High-altitude mountain expeditions, colonial heritage retreats, sea-of-clouds ridges, and pristine tropical islands with verified itineraries.'
              )}
            </p>
          </div>
          <div className="w-full lg:w-auto">
            <StatRow
              stats={[
                {
                  value: packages.length,
                  suffix: '+',
                  label: t('popularPackages.statPopular', 'Popular Packages'),
                },
                {
                  value: destinations,
                  suffix: '+',
                  label: t('popularPackages.statDestinations', 'Destinations'),
                },
                {
                  value: 100,
                  suffix: '%',
                  label: t('popularPackages.statSatisfaction', 'Satisfaction'),
                },
              ]}
            />
          </div>
        </Reveal>

        {/* Filter Navigation Dock */}
        <div className="mt-10 flex flex-wrap items-center gap-2.5 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {t('popularPackages.tabAll', 'All Famous Places')} ({formatNumber(packages.length)})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('himalayan')}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'himalayan'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-cyan-500" />
            <span>
              {t('popularPackages.tabHimalayan', 'Himalayan & Snow Wonders')} ({formatNumber(6)})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bangladesh')}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'bangladesh'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>🌴 {t('popularPackages.tabBangladesh', 'Bangladesh Top Wonders')}</span>
          </button>
        </div>

        {/* 3-column card grid matching screenshot */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.08}>
              <PackageFlipCard pkg={p} />
            </Reveal>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/packages" className="btn-ghost group text-sm sm:text-base px-7 py-3.5 shadow-sm hover:shadow-lg">
            <span>Explore all packages</span>
            <ArrowRight className="h-4 w-4 text-brand-500 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
