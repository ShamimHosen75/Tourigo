'use client';

import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

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

export function StatRow({ stats }: { stats: { value: number; suffix?: string; label: string }[] }) {
  return (
    <div className="flex gap-8">
      {stats.map((s) => (
        <div key={s.label}>
          <div className="font-display text-2xl font-bold text-brand-500">
            <CountUp to={s.value} suffix={s.suffix} />
          </div>
          <div className="text-xs text-ink-mute">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
