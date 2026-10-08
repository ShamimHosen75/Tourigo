'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { imageFor } from '@/lib/scene';
import type { SceneKind } from '@/lib/types';

export function PackageGallery({ images, scene, seed, title }: { images: string[]; scene: SceneKind; seed: string; title: string }) {
  // Without uploaded photos, show three variations of the generated artwork.
  const srcs = images.length ? images : [0, 1, 2].map((i) => imageFor(null, scene, `${seed}-${i}`));
  const [i, setI] = useState(0);
  const go = (d: number) => setI((v) => (v + d + srcs.length) % srcs.length);

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_190px]">
      <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl lg:aspect-[2/1] bg-slate-200 shadow-card">
        <AnimatePresence initial={false} mode="popLayout">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img key={i} src={srcs[i]} alt={`${title} photo ${i + 1}`} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 h-full w-full object-cover" />
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">
            Photo {i + 1} of {srcs.length}
          </p>
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <div className="absolute bottom-5 right-4 flex gap-1.5">
          {srcs.map((_, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Photo ${k + 1}`} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-brand-400' : 'w-1.5 bg-white/60'}`} />
          ))}
        </div>
        {srcs.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-ink opacity-0 shadow transition group-hover:opacity-100">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-ink opacity-0 shadow transition group-hover:opacity-100">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
        {srcs.map((s, k) => (
          <button key={k} onClick={() => setI(k)} className={`relative aspect-[16/10] w-36 shrink-0 overflow-hidden rounded-xl ring-2 transition lg:w-full ${k === i ? 'ring-brand-400' : 'opacity-70 ring-transparent hover:opacity-100'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
