'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, ChevronDown, CloudRain, Compass, Flower2, MapPin, Snowflake, Star } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { HeroArt, type WeatherMode } from './HeroArt';
import { WeatherCanvas } from './WeatherCanvas';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { translations } from '@/lib/i18n/translations';

/* ── Weather mode config ─────────────────────────────────────────────────── */
const modes: {
  id: WeatherMode;
  label: string;
  sublabel: string;
  Icon: typeof CloudRain;
  gradient: string;
  accent: string;
  skyWord: string;
}[] = [
  {
    id: 'rain',
    label: 'Monsoon',
    sublabel: 'Misty jungle trails',
    Icon: CloudRain,
    gradient: 'from-teal-500 via-emerald-500 to-cyan-600',
    accent: '#2dd4bf',
    skyWord: 'Explore the mist',
  },
  {
    id: 'bloom',
    label: 'Golden Dawn',
    sublabel: 'Spring valley bloom',
    Icon: Flower2,
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    accent: '#fb923c',
    skyWord: 'Chase the sunrise',
  },
  {
    id: 'snow',
    label: 'Arctic',
    sublabel: 'Glacial peak crossing',
    Icon: Snowflake,
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    accent: '#60a5fa',
    skyWord: 'Conquer the peaks',
  },
];

/* ── Traveler avatar stack ───────────────────────────────────────────────── */
const AVATARS = [
  { initials: 'RA', color: 'from-rose-500 to-pink-600',    name: 'Rahman A.', trips: 12 },
  { initials: 'SM', color: 'from-violet-500 to-purple-600', name: 'Sara M.',   trips: 8  },
  { initials: 'KH', color: 'from-amber-500 to-orange-500',  name: 'Kamal H.', trips: 15 },
  { initials: 'NB', color: 'from-emerald-500 to-teal-600',  name: 'Nadia B.', trips: 6  },
  { initials: 'JI', color: 'from-sky-500 to-cyan-600',      name: 'Jamal I.', trips: 20 },
];

function TravelerAvatars({ className = '' }: { className?: string }) {
  const { t, formatNumber } = useLanguage();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* stacked avatars */}
      <div className="flex -space-x-2.5">
        {AVATARS.map((a, i) => (
          <div
            key={a.initials}
            className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br ${a.color} text-[11px] font-black text-white ring-2 ring-slate-950/80 avatar-float shadow-lg`}
            style={{ animationDelay: `${i * 0.6}s`, zIndex: AVATARS.length - i }}
            title={`${a.name} — ${a.trips} trips`}
          >
            {a.initials}
          </div>
        ))}
        {/* +more badge */}
        <div
          className="relative z-0 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/15 text-[10px] font-black text-white ring-2 ring-slate-950/80 backdrop-blur-sm"
        >
          +{formatNumber(2)}k
        </div>
      </div>
      {/* label */}
      <div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
          ))}
          <span className="ml-0.5 text-[11px] font-bold text-white/90">{formatNumber('4.9')}</span>
        </div>
        <p className="text-[11px] font-semibold text-white/70 leading-tight">
          {t('hero.travelerReviews', '2,000+ happy travelers')}
        </p>
      </div>
    </div>
  );
}

/* ── Mini trip stats bar ─────────────────────────────────────────────────── */
function TripStats({ mode }: { mode: WeatherMode }) {
  const { t, formatNumber } = useLanguage();
  const cfg = modes.find((m) => m.id === mode)!;
  const stats = [
    { Icon: MapPin, value: `${formatNumber(36)}+`, label: t('popularPackages.statDestinations', 'Destinations') },
    { Icon: Compass, value: `${formatNumber(8)}+`, label: t('popularPackages.statPopular', 'Packages') },
    { Icon: Star, value: `${formatNumber(100)}%`, label: t('popularPackages.statSatisfaction', 'Satisfaction') },
  ];
  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="flex items-center gap-4 sm:gap-6"
    >
      {stats.map(({ Icon, value, label }, i) => (
        <div key={label} className={`flex items-center gap-1.5 ${i > 0 ? 'border-l border-white/15 pl-4 sm:pl-6' : ''}`}>
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.gradient} shadow-md`}
          >
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-white leading-none">{value}</p>
            <p className="text-[10px] font-semibold text-white/60 leading-tight">{label}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ── Parallax mouse layer ────────────────────────────────────────────────── */
function ParallaxLayer({
  children,
  factor,
  className,
}: {
  children: React.ReactNode;
  factor: number;
  className?: string;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { damping: 30, stiffness: 80 });
  const sy = useSpring(my, { damping: 30, stiffness: 80 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * factor * 30;
      const dy = (e.clientY / window.innerHeight - 0.5) * factor * 20;
      mx.set(dx);
      my.set(dy);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [factor, mx, my]);

  return (
    <motion.div style={{ x: sx, y: sy }} className={className}>
      {children}
    </motion.div>
  );
}

export function Hero() {
  const { t, locale, formatNumber } = useLanguage();
  const [mode, setMode] = useState<WeatherMode>('rain');
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Scroll-driven parallax
  const contentY   = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const contentOp  = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const bgScale    = useTransform(scrollYProgress, [0, 1], [1, 1.18]);

  const photo = siteConfig.heroImages[mode];

  const getModeInfo = (mId: WeatherMode) => {
    const base = modes.find((m) => m.id === mId)!;
    const loc = translations[locale]?.hero?.weatherModes?.[mId];
    return {
      ...base,
      label: loc?.label ?? base.label,
      sublabel: loc?.sublabel ?? base.sublabel,
      skyWord: loc?.skyWord ?? base.skyWord,
    };
  };

  const cfg = getModeInfo(mode);

  return (
    <section
      ref={ref}
      className="relative h-[calc(100svh-var(--header-h))] min-h-[660px] overflow-hidden bg-slate-950"
    >
      {/* ── Background: photo or illustrated art ──────────────────────── */}
      <motion.div style={{ scale: bgScale }} className="absolute inset-0 origin-center">
        <AnimatePresence initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 animate-ken-burns"
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="h-full w-full object-cover object-center" />
            ) : (
              <HeroArt mode={mode} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Weather particle canvas ───────────────────────────────────── */}
      <WeatherCanvas mode={mode} />

      {/* ── Cinematic gradient overlays ───────────────────────────────── */}
      {/* top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-slate-950/60 via-slate-950/20 to-transparent" />
      {/* bottom vignette — stronger */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />
      {/* left edge */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950/40 to-transparent" />
      {/* right edge */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950/40 to-transparent" />

      {/* ── Colour accent tint layer (per weather mode) ───────────────── */}
      <AnimatePresence>
        <motion.div
          key={`tint-${mode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
          style={{
            background: `linear-gradient(to top, ${cfg.accent}22, transparent)`,
          }}
        />
      </AnimatePresence>

      {/* ── Parallax floating bokeh glows ─────────────────────────────── */}
      <ParallaxLayer factor={0.3} className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[8%] top-[20%] h-40 w-40 rounded-full blur-3xl hero-bokeh"
          style={{ background: `${cfg.accent}18` }}
        />
        <div
          className="absolute right-[12%] top-[30%] h-56 w-56 rounded-full blur-3xl hero-bokeh"
          style={{ background: `${cfg.accent}12`, animationDelay: '4s' }}
        />
        <div
          className="absolute left-[40%] top-[55%] h-32 w-32 rounded-full blur-2xl hero-float-b"
          style={{ background: `${cfg.accent}10` }}
        />
      </ParallaxLayer>

      {/* ── Main content stack ────────────────────────────────────────── */}
      <motion.div
        style={{ y: contentY, opacity: contentOp }}
        className="relative z-10 flex h-full flex-col items-start justify-end px-5 pb-[clamp(80px,12vh,130px)] sm:px-10 lg:px-16"
      >
        {/* Sky label — floats top left aligned with content column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-4 flex items-center gap-2"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={`sky-${mode}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className={`bg-gradient-to-r ${cfg.gradient} bg-clip-text text-[11px] font-black uppercase tracking-[0.22em] text-transparent`}
            >
              {cfg.skyWord}
            </motion.span>
          </AnimatePresence>
          <span className="h-px w-10 bg-gradient-to-r from-white/40 to-transparent" />
        </motion.div>

        {/* ── Heading ──────────────────────────────────────────────────── */}
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(1.9rem,4.5vw,3.6rem)] font-black leading-[1.08] tracking-tight text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.55)]"
          >
            <span className="block">{t('hero.titleLine1', 'Adventure Starts')}</span>
            <span className="block">
              {locale === 'en' ? 'With ' : ''}
              <AnimatePresence mode="wait">
                <motion.span
                  key={`word-${mode}-${locale}`}
                  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-block bg-gradient-to-r ${cfg.gradient} bg-clip-text text-transparent hero-shimmer`}
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${cfg.accent}, #ffffff, ${cfg.accent}, #ffffff, ${cfg.accent})`,
                  }}
                >
                  {t('hero.titleLine2', 'Your Journey')}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          {/* ── Avatar row — aligned under heading ────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
          >
            {/* LEFT: description + avatar */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <p className="max-w-md text-sm sm:text-base font-medium leading-relaxed text-white/70">
                {t(
                  'hero.description',
                  'Handpicked treks, guided tours & wilderness escapes across Bangladesh — from the hills of Bandarban to the shores of Saint Martin.'
                )}
              </p>
              {/* Avatars — inline with heading width */}
              <TravelerAvatars />
            </div>

            {/* RIGHT: trip stats */}
            <div className="hidden sm:block">
              <TripStats mode={mode} />
            </div>
          </motion.div>

          {/* Mobile trip stats (below avatars on small screens) */}
          <div className="mt-4 sm:hidden">
            <TripStats mode={mode} />
          </div>

          {/* ── CTA Buttons ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <a
              href="#categories"
              className={`group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r ${cfg.gradient} px-6 py-3.5 text-sm font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl active:scale-[0.97]`}
              style={{ boxShadow: `0 12px 40px -8px ${cfg.accent}55` }}
            >
              <span>{t('hero.searchButton', 'Explore Treks & Tours')}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            <Link
              href="/packages"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/18 hover:-translate-y-0.5 hover:border-white/35 active:scale-[0.97] shadow-lg"
            >
              {t('common.viewAll', 'View All Packages')}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Weather mode switcher — centered horizontal dock ──────────── */}
      <div
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
        role="radiogroup"
        aria-label="Select weather atmosphere"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">
            Atmosphere
          </p>
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/15 bg-black/45 p-1.5 backdrop-blur-xl shadow-2xl">
            {modes.map(({ id, Icon, gradient }) => {
              const info = getModeInfo(id);
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={mode === id}
                  onClick={() => setMode(id)}
                  className={`group relative flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all duration-300 ${
                    mode === id
                      ? 'border-white/20 bg-white/15 shadow-lg'
                      : 'border-transparent hover:bg-white/8 hover:border-white/10'
                  }`}
                >
                  {/* active indicator — bottom bar */}
                  {mode === id && (
                    <motion.span
                      layoutId="weather-bar"
                      className={`absolute inset-x-3 -bottom-0.5 h-[2.5px] rounded-full bg-gradient-to-r ${gradient}`}
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-bold leading-none ${mode === id ? 'text-white' : 'text-white/65'}`}>
                      {info.label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/40 leading-tight">{info.sublabel}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Scroll indicator — bottom left ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-7 left-5 z-20 hidden flex-col items-center gap-1.5 sm:left-8 sm:flex"
      >
        <a
          href="#categories"
          className="flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 backdrop-blur-md transition hover:text-white hover:bg-black/50"
        >
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
          Scroll to explore
        </a>
      </motion.div>
    </section>
  );
}
