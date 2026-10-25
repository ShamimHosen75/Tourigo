'use client';

import Link from 'next/link';
import { ArrowRight, Package as PackageIcon } from 'lucide-react';
import type { Category } from '@/lib/types';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Reveal } from '@/components/ui/Reveal';
import { SmartImage } from '@/components/ui/SmartImage';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Categories({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const { t, formatNumber } = useLanguage();

  return (
    <section id="categories" className="scroll-mt-28 py-24 sm:py-28 relative overflow-hidden bg-slate-50/60">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-sky-100/50 blur-3xl" />

      <div className="container relative">
        <Reveal>
          <SectionBadge>{t('categories.badge', 'Explore Categories')}</SectionBadge>
          <h2 className="section-title mt-4">
            {t('categories.title', 'Find Your Perfect')}{' '}
            <span className="accent">{t('categories.titleAccent', 'Adventure Style')}</span>
          </h2>
          <p className="mt-3.5 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600">
            {t(
              'categories.description',
              'Discover curated travel experiences tailored for families, couples, adventurers and explorers across Bangladesh.'
            )}
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => {
            const count = counts[c.slug] ?? 0;
            return (
              <Reveal key={c.slug} delay={(i % 4) * 0.08}>
                <Link
                  href={`/packages?category=${c.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-slate-200 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.18)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_22px_50px_-15px_rgba(0,174,240,0.28)] ring-1 ring-black/5 sm:aspect-[1/1.12]"
                >
                  <SmartImage
                    src={c.image}
                    scene={c.scene}
                    seed={c.slug}
                    alt={c.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* poster lettering top fade */}
                  <div className="absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white via-white/85 to-transparent" />
                  <p className="absolute inset-x-3 top-3 text-center font-display text-[clamp(1.2rem,3.4vw,2.3rem)] font-black uppercase leading-[0.9] tracking-tight text-slate-900 [text-wrap:balance] transition-all duration-500 group-hover:tracking-normal group-hover:text-brand-700">
                    {c.displayTitle}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/15">
                      <PackageIcon className="h-3 w-3" />{' '}
                      {count === 1
                        ? t('categories.singlePackage', '1 Package')
                        : t('categories.packageCount', `${count} Packages`, { count })}
                    </span>
                    <h3 className="mt-2 text-base font-bold sm:text-lg leading-snug">{c.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[11px] text-white/80 sm:text-xs leading-relaxed">
                      {c.description}
                    </p>
                    <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 transition-colors group-hover:text-white">
                      {t('categories.exploreTours', 'Explore Tours')}{' '}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
