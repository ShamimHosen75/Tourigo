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
  const days = `${pkg.durationDays}D`;

  return (
    <div className="group h-[380px] [perspective:1400px]" onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)}>
      <motion.div className="preserve-3d relative h-full w-full" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 120, damping: 16, mass: 0.8 }}>
        {/* front */}
        <div className="backface-hidden absolute inset-0 overflow-hidden rounded-2xl bg-slate-800 shadow-card">
          <SmartImage src={pkg.image} scene={pkg.scene} seed={pkg.slug} alt={pkg.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/10" />
          <div className="absolute inset-x-3 top-3 flex items-center gap-1.5">
            <span className="chip bg-white text-[10px] text-brand-600">{pkg.level}</span>
            <span className="chip bg-white text-[10px] text-ink">{days}</span>
            <button type="button" onClick={() => setFlipped((v) => !v)} aria-label="Show details" className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/35">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <h3 className="text-lg font-bold leading-tight">{pkg.title}</h3>
            {pkg.tagline && <p className="mt-0.5 text-xs text-white/70">{pkg.tagline}</p>}
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-white/60">Starting From</p>
                <p className="font-display text-2xl font-bold">{formatPrice(pkg.price)}</p>
              </div>
              <div className="rounded-lg bg-black/40 px-2.5 py-1.5 text-right backdrop-blur">
                <p className="text-[9px] text-white/60">Age Group</p>
                <p className="text-[11px] font-semibold text-brand-300">{pkg.ageGroup}</p>
              </div>
            </div>
          </div>
        </div>

        {/* back */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col rounded-2xl bg-[#0b1324] p-4 text-white shadow-2xl ring-1 ring-white/10">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold leading-tight">{pkg.title}</h3>
            <button type="button" onClick={() => setFlipped((v) => !v)} aria-label="Show photo" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-white/70">{pkg.shortDescription}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Spec icon={<Calendar className="h-3 w-3" />} label="Duration" value={`${pkg.durationDays} Day${pkg.durationDays > 1 ? 's' : ''}${pkg.durationNights ? ` / ${pkg.durationNights}N` : ''}`} />
            <Spec icon={<Mountain className="h-3 w-3" />} label="Altitude" value={pkg.altitude ?? 'N/A'} />
            <Spec icon={<TrendingUp className="h-3 w-3" />} label="Level" value={pkg.level} />
            <Spec icon={<Users className="h-3 w-3" />} label="Gender" value={pkg.gender} highlight />
          </div>
          <div className="mt-auto flex items-end justify-between pt-3">
            <div>
              <p className="text-[10px] text-white/50">Starting From</p>
              <p className="font-display text-xl font-bold text-brand-400">{formatPrice(pkg.price)}</p>
            </div>
            <p className="text-[10px] text-white/50">Per Person</p>
          </div>
          <Link href={`/packages/${pkg.slug}`} className="btn-primary mt-3 w-full py-2.5">
            Explore Adventure <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Spec({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
      <p className="flex items-center gap-1 text-[10px] text-white/50">
        {icon} {label}
      </p>
      <p className={`mt-0.5 text-xs font-semibold ${highlight ? 'text-brand-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}
