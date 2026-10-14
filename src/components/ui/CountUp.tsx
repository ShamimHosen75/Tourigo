'use client';

import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Compass, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

export function CountUp({ to, suffix = '', duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration, ease: 'easeOut', onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to, duration]);
  return (
    <span ref={ref}>
      {value >= 1000 ? `${Math.round(value / 100) / 10}K`.replace('.0K', 'K') : value}
      {suffix}
    </span>
  );
}

const defaultIcons = [Compass, MapPin, ShieldCheck, Sparkles];

export function StatRow({
  stats,
  className = '',
}: {
  stats: { value: number; suffix?: string; label: string; icon?: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/80 p-3 sm:p-4 md:p-5 shadow-[0_10px_35px_-10px_rgba(0,174,240,0.15)] backdrop-blur-xl transition-all duration-500 hover:border-brand-300 hover:shadow-[0_16px_40px_-12px_rgba(0,174,240,0.22)] ring-1 ring-slate-900/[0.03] ${className}`}
    >
      {/* subtle ambient light */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-400/10 blur-2xl transition duration-500 group-hover:bg-brand-400/20" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {stats.map((s, idx) => {
          const Icon = defaultIcons[idx % defaultIcons.length];
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 pt-3 sm:pt-0 ${idx > 0 ? 'sm:pl-6' : ''} transition-transform duration-300 hover:-translate-y-0.5`}
            >
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-sky-100/70 text-brand-600 shadow-sm border border-brand-200/50">
                {s.icon ?? <Icon className="h-5 w-5" />}
              </div>
              <div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 bg-clip-text text-transparent">
                  <CountUp to={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {s.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

