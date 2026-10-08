'use client';

import { useEffect, useRef } from 'react';
import type { WeatherMode } from './HeroArt';

type Particle = { x: number; y: number; vx: number; vy: number; size: number; rot: number; vr: number; sway: number; hue: number };

const PETAL_COLORS = ['#f9a8d4', '#fbcfe8', '#f472b6', '#fde68a', '#fecdd3'];

/** Full-bleed canvas that draws rain, falling petals or snow. */
export function WeatherCanvas({ mode }: { mode: WeatherMode }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const flash = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let particles: Particle[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const spawn = (initial: boolean): Particle => {
      const base = { x: Math.random() * w, y: initial ? Math.random() * h : -20, rot: Math.random() * Math.PI * 2, sway: Math.random() * Math.PI * 2, hue: Math.floor(Math.random() * PETAL_COLORS.length) };
      if (mode === 'rain') return { ...base, vx: -1.2, vy: 14 + Math.random() * 8, size: 12 + Math.random() * 14, vr: 0 };
      if (mode === 'bloom') return { ...base, vx: 0.6 + Math.random(), vy: 0.8 + Math.random() * 1.2, size: 5 + Math.random() * 5, vr: (Math.random() - 0.5) * 0.06 };
      return { ...base, vx: 0, vy: 0.6 + Math.random() * 1.4, size: 1.2 + Math.random() * 2.8, vr: 0 };
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = mode === 'rain' ? 0.00022 : mode === 'bloom' ? 0.00005 : 0.00018;
      const count = Math.round(w * h * density * (reduce ? 0.3 : 1));
      particles = Array.from({ length: count }, () => spawn(true));
    };

    let t = 0;
    let nextFlash = 240 + Math.random() * 400;
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        if (mode === 'rain') {
          ctx.strokeStyle = 'rgba(220,235,255,0.55)';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 1.5, p.y + p.size);
          ctx.stroke();
          p.x += p.vx;
          p.y += p.vy;
        } else if (mode === 'bloom') {
          p.sway += 0.02;
          p.rot += p.vr;
          p.x += p.vx * 0.6 + Math.sin(p.sway) * 0.8;
          p.y += p.vy;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, 0.55 + 0.45 * Math.sin(p.sway * 2));
          ctx.fillStyle = PETAL_COLORS[p.hue];
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          p.sway += 0.01;
          p.x += Math.sin(p.sway) * 0.5;
          p.y += p.vy;
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        if (p.y > h + 20 || p.x > w + 40 || p.x < -40) Object.assign(p, spawn(false));
      }
      if (mode === 'rain' && !reduce && t > nextFlash && flash.current) {
        flash.current.animate([{ opacity: 0 }, { opacity: 0.35 }, { opacity: 0.05 }, { opacity: 0.25 }, { opacity: 0 }], { duration: 700 });
        nextFlash = t + 400 + Math.random() * 600;
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [mode]);

  return (
    <>
      <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
      <div ref={flash} className="pointer-events-none absolute inset-0 bg-white opacity-0" aria-hidden />
    </>
  );
}
