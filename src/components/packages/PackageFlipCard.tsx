'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Mountain, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { formatPrice } from '@/config/site';
import type { Package } from '@/lib/types';
import { SmartImage } from '@/components/ui/SmartImage';

export type CardPackage = Pick<Package, 'slug' | 'title' | 'level' | 'durationDays' | 'durationNights' | 'price' | 'ageGroup' | 'gender' | 'altitude' | 'shortDescription' | 'scene' | 'tagline'> & { image?: string };

/** Trek card that flips in 3D on hover (or with the rotate button on touch screens). */
export function PackageFlipCard({ pkg }: { pkg: CardPackage }) {
  const [flipped, setFlipped] = useState(false);
  const days = `${pkg.durationDays}D / ${pkg.durationNights ?? Math.max(1, pkg.durationDays - 1)}N`;

  return (
    <div className="group h-[405px] [perspective:1400px]" onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)}>
      <motion.div className="preserve-3d relative h-full w-full" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 120, damping: 16, mass: 0.8 }}>
        {/* front */}
        <div className="backface-hidden absolute inset-0 overflow-hidden rounded-3xl bg-slate-800 shadow-[0_12px_36px_-12px_rgba(15,23,42,0.25)] ring-1 ring-black/10">
          <SmartImage src={pkg.image} scene={pkg.scene} seed={pkg.slug} alt={pkg.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
          
          {/* top badges */}
          <div className="absolute inset-x-4 top-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-brand-700 shadow-md backdrop-blur-md">
              {pkg.level}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-3 py-1 text-[11px] font-semibold text-white/95 border border-white/15 backdrop-blur-md">
              {days}
            </span>
            <button
              type="button"
              onClick={() => setFlipped((v) => !v)}
              aria-label="Show details"
              className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-white/25 text-white backdrop-blur-md transition-all hover:bg-white/40 hover:scale-110"
            >
              <RefreshCw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180" />
            </button>
          </div>

          {/* bottom content */}
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <h3 className="text-xl font-bold leading-snug drop-shadow-sm">{pkg.title}</h3>
            {pkg.tagline && <p className="mt-1 line-clamp-1 text-xs text-white/80">{pkg.tagline}</p>}
            <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">Starting From</p>
                <p className="font-display text-2xl font-black text-white">{formatPrice(pkg.price)}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-right backdrop-blur-md">
                <p className="text-[9px] uppercase tracking-wider text-white/70">Group Type</p>
                <p className="text-xs font-bold text-sky-300">{pkg.ageGroup}</p>
              </div>
            </div>
          </div>
        </div>

        {/* back */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-[#0b1324] to-slate-950 p-5 text-white shadow-2xl ring-1 ring-white/15">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-block rounded-full bg-brand-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-300 border border-brand-500/30">
                Package Details
              </span>
              <h3 className="mt-1.5 text-lg font-bold leading-tight">{pkg.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setFlipped((v) => !v)}
              aria-label="Show photo"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-slate-300">{pkg.shortDescription}</p>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Spec icon={<Calendar className="h-3.5 w-3.5" />} label="Duration" value={`${pkg.durationDays}D / ${pkg.durationNights ?? 1}N`} />
            <Spec icon={<Mountain className="h-3.5 w-3.5" />} label="Altitude" value={pkg.altitude ?? 'N/A'} />
            <Spec icon={<TrendingUp className="h-3.5 w-3.5" />} label="Difficulty" value={pkg.level} />
            <Spec icon={<Users className="h-3.5 w-3.5" />} label="Category" value={pkg.gender} highlight />
          </div>
          <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50">Starting From</p>
              <p className="font-display text-2xl font-extrabold text-brand-400">{formatPrice(pkg.price)}</p>
            </div>
            <p className="text-[11px] font-medium text-white/50">Per Person</p>
          </div>
          <Link href={`/packages/${pkg.slug}`} className="btn-primary mt-3 w-full py-3 text-xs tracking-wide uppercase font-bold">
            <span>Explore Tour</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Spec({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm transition-colors hover:border-brand-400/40 hover:bg-white/10">
      <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/60">
        {icon} {label}
      </p>
      <p className={`mt-1 text-xs font-bold ${highlight ? 'text-brand-300' : 'text-white'}`}>{value}</p>
    </div>
  );
}
