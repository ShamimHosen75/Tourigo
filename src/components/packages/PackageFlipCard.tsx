'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Info, Mountain, RefreshCw, TrendingUp, Users } from 'lucide-react';
import type { Package } from '@/lib/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export type CardPackage = Pick<
  Package,
  | 'slug'
  | 'title'
  | 'level'
  | 'durationDays'
  | 'durationNights'
  | 'price'
  | 'ageGroup'
  | 'gender'
  | 'altitude'
  | 'shortDescription'
  | 'scene'
  | 'tagline'
  | 'badge'
> & { image?: string };

export function PackageFlipCard({ pkg }: { pkg: CardPackage }) {
  const { t, formatPrice, formatNumber } = useLanguage();
  const [flipped, setFlipped] = useState(false);
  const nightsNum = pkg.durationNights ?? Math.max(1, pkg.durationDays - 1);
  const days = `${formatNumber(pkg.durationDays)}D / ${formatNumber(nightsNum)}N`;
  const badgeText = pkg.badge || (pkg.level === 'Beginner' ? t('flipCard.mostPopular', 'Most Popular') : pkg.level);

  return (
    <div className="group h-[430px] [perspective:1400px]">
      <motion.div
        className="preserve-3d relative h-full w-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.8 }}
      >
        {/* FRONT FACE: Clean white card with realistic destination photography */}
        <div className="backface-hidden absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_36px_-6px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1">
          {/* Top realistic photo */}
          <div className="relative h-56 w-full overflow-hidden bg-slate-100">
            <SmartImage
              src={pkg.image}
              scene={pkg.scene}
              seed={pkg.slug}
              alt={pkg.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Subtle top overlay for text readability */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/25" />

            {/* Floating dark frosted pill badge (like screenshot) */}
            <div className="absolute left-3.5 top-3.5 z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide shadow-sm border border-white/10">
                {badgeText}
              </span>
            </div>

            {/* Flip / Specs quick button in top-right */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setFlipped(true);
              }}
              title="Click to flip & view specs"
              aria-label="View specifications"
              className="absolute right-3.5 top-3.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-black/45 text-white/90 backdrop-blur-md transition-all hover:bg-black/75 hover:scale-110 border border-white/10"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Bottom Card Content: Title, Highlights & Pricing */}
          <div className="flex flex-1 flex-col justify-between p-5 bg-white">
            <div>
              <Link href={`/packages/${pkg.slug}`} className="block">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition-colors tracking-tight line-clamp-1">
                  {pkg.title}
                </h3>
              </Link>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {pkg.tagline || pkg.shortDescription}
              </p>
            </div>

            {/* Bottom row: "From ৳..." + "View Tours →" */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-xs sm:text-sm font-semibold text-slate-700">
                  {t('flipCard.from', 'From')}
                </span>
                <span className="font-bold text-slate-900 text-lg sm:text-xl font-display tracking-tight">
                  {formatPrice(pkg.price)}
                </span>
              </div>

              <Link
                href={`/packages/${pkg.slug}`}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cyan-600 hover:text-cyan-700 group-hover:gap-2 transition-all"
              >
                <span>{t('flipCard.viewTours', 'View Tours')}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* BACK FACE: Detailed trek specifications & quick book */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col rounded-2xl bg-gradient-to-b from-slate-900 via-[#0b1324] to-slate-950 p-5 text-white shadow-2xl ring-1 ring-white/15">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-block rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 border border-cyan-500/30">
                {t('flipCard.tourOverview', 'Tour Overview')}
              </span>
              <h3 className="mt-1.5 text-base font-bold leading-tight">{pkg.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setFlipped(false)}
              aria-label={t('flipCard.backToCard', 'Back to card')}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-slate-300">{pkg.shortDescription}</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Spec icon={<Calendar className="h-3.5 w-3.5" />} label={t('flipCard.duration', 'Duration')} value={days} />
            <Spec icon={<Mountain className="h-3.5 w-3.5" />} label="Altitude" value={pkg.altitude ?? 'N/A'} />
            <Spec icon={<TrendingUp className="h-3.5 w-3.5" />} label="Difficulty" value={pkg.level} />
            <Spec icon={<Users className="h-3.5 w-3.5" />} label="Category" value={pkg.gender} highlight />
          </div>

          <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50">Starting From</p>
              <p className="font-display text-2xl font-extrabold text-cyan-400">{formatPrice(pkg.price)}</p>
            </div>
            <p className="text-[11px] font-medium text-white/50">Per Person</p>
          </div>

          <Link
            href={`/packages/${pkg.slug}`}
            className="btn-primary mt-3 w-full py-2.5 text-xs tracking-wide uppercase font-bold text-center"
          >
            <span>Explore Tour</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1 inline" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Spec({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm transition-colors hover:border-cyan-400/40 hover:bg-white/10">
      <p className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-white/60">
        {icon} {label}
      </p>
      <p className={`mt-0.5 text-xs font-bold ${highlight ? 'text-cyan-300' : 'text-white'}`}>{value}</p>
    </div>
  );
}
