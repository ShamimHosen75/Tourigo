'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { CloudRain, Flower2, Mouse, Snowflake } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { HeroArt, type WeatherMode } from './HeroArt';
import { WeatherCanvas } from './WeatherCanvas';

const modes: { id: WeatherMode; label: string; Icon: typeof CloudRain; ring: string }[] = [
  { id: 'rain', label: 'Monsoon rain', Icon: CloudRain, ring: 'from-emerald-400 to-teal-600' },
  { id: 'bloom', label: 'Spring blossoms', Icon: Flower2, ring: 'from-pink-400 to-rose-500' },
  { id: 'snow', label: 'Winter snow', Icon: Snowflake, ring: 'from-sky-300 to-brand-500' },
];

export function Hero() {
  const [mode, setMode] = useState<WeatherMode>('rain');
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const line1Y = useTransform(scrollYProgress, [0, 0.5], [0, -120]);
  const line1Opacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const line2Y = useTransform(scrollYProgress, [0, 0.6], [0, -60]);
  const artScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const photo = siteConfig.heroImages[mode];

  return (
    <section ref={ref} className="relative h-[calc(100svh-var(--header-h))] min-h-[560px] overflow-hidden bg-slate-900">
      <motion.div style={{ scale: artScale }} className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1 }} className="absolute inset-0 animate-ken-burns">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <HeroArt mode={mode} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <WeatherCanvas mode={mode} />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/30 to-transparent" />

      <div className="relative z-10 flex flex-col items-center px-4 pt-[7vh] text-center">
        <motion.h1 style={{ y: line1Y, opacity: line1Opacity }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="font-display text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,.35)] sm:text-5xl md:text-6xl">
          Adventure Starts With
        </motion.h1>
        <motion.p style={{ y: line2Y }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="mt-2 bg-gradient-to-r from-sky-300 via-brand-400 to-cyan-300 bg-clip-text font-display text-5xl font-extrabold tracking-tight text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,.25)] sm:text-6xl md:text-7xl">
          Your Journey
        </motion.p>
      </div>

      {/* weather switcher */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-black/35 p-1.5 backdrop-blur-md" role="radiogroup" aria-label="Hero weather">
        {modes.map(({ id, label, Icon, ring }) => (
          <button key={id} role="radio" aria-checked={mode === id} aria-label={label} title={label} onClick={() => setMode(id)} className="relative grid h-9 w-9 place-items-center rounded-full text-white/80 transition hover:text-white">
            {mode === id && <motion.span layoutId="weather-pill" className={`absolute inset-0 rounded-full bg-gradient-to-br ${ring} shadow-lg`} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
            <Icon className="relative h-4 w-4" />
          </button>
        ))}
      </div>

      <a href="#categories" className="absolute bottom-7 left-5 z-20 hidden items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur sm:flex">
        <span className="relative">
          <Mouse className="h-4 w-4" />
          <span className="absolute left-1/2 top-[3px] h-1 w-0.5 -translate-x-1/2 animate-scroll-dot rounded bg-white" />
        </span>
        Scroll to explore
      </a>
    </section>
  );
}
