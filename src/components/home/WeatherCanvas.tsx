'use client';

import { useEffect, useRef } from 'react';
import type { WeatherMode } from './HeroArt';

type Particle = {
  x: number; y: number; vx: number; vy: number;
  size: number; rot: number; vr: number; sway: number;
  hue: number; layer: number; alpha: number;
};

const PETAL_COLORS = ['#f9a8d4', '#fbcfe8', '#f472b6', '#fde68a', '#fecdd3', '#fca5a5', '#c4b5fd'];

/** Full-bleed canvas that draws realistic rain, falling petals or snow. */
export function WeatherCanvas({ mode }: { mode: WeatherMode }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const flash = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0;
    let particles: Particle[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const spawn = (initial: boolean): Particle => {
      const base: Particle = {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -20,
        rot: Math.random() * Math.PI * 2,
        sway: Math.random() * Math.PI * 2,
        hue: Math.floor(Math.random() * PETAL_COLORS.length),
        layer: Math.random(),   // 0=near/fast, 1=far/slow
        alpha: 0, vx: 0, vy: 0, size: 0, vr: 0,
      };
      if (mode === 'rain') {
        const d = 0.4 + base.layer * 0.6;   // depth factor
        return { ...base, vx: -1.8 * d, vy: (18 + Math.random() * 10) * d, size: (10 + Math.random() * 12) * d, vr: 0, alpha: 0.35 + d * 0.35 };
      }
      if (mode === 'bloom') {
        return { ...base, vx: 0.6 + Math.random() * 0.8, vy: 0.7 + Math.random() * 1.1, size: 4 + Math.random() * 6, vr: (Math.random() - 0.5) * 0.07, alpha: 0.65 + Math.random() * 0.35 };
      }
      // snow
      const d = 0.3 + base.layer * 0.7;
      return { ...base, vx: 0, vy: (0.5 + Math.random() * 1.2) * d, size: (1.0 + Math.random() * 3.0) * d, vr: 0, alpha: 0.55 + d * 0.40 };
    };

    // Splash pool for rain
    type Splash = { x: number; y: number; r: number; life: number };
    const splashes: Splash[] = [];

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = mode === 'rain' ? 0.00028 : mode === 'bloom' ? 0.000055 : 0.00022;
      const count = Math.round(w * h * density * (reduce ? 0.3 : 1));
      particles = Array.from({ length: count }, () => spawn(true));
    };

    let t = 0;
    let windGust = 0, windTimer = 0;
    let nextFlash = 180 + Math.random() * 360;

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, w, h);

      // ── wind gust for bloom ──
      if (mode === 'bloom') {
        if (t >= windTimer) {
          windGust = (Math.random() - 0.4) * 2.5;
          windTimer = t + 90 + Math.random() * 180;
        }
        windGust *= 0.97; // dampen
      }

      for (const p of particles) {
        if (mode === 'rain') {
          // depth-layered rain streak
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = `rgba(180,215,255,1)`;
          ctx.lineWidth = p.layer > 0.6 ? 1.3 : 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2.2, p.y + p.size);
          ctx.stroke();
          ctx.restore();
          p.x += p.vx;
          p.y += p.vy;
          // spawn splash near ground
          if (p.y > h * 0.82 && p.y < h * 0.84 && Math.random() < 0.18) {
            splashes.push({ x: p.x, y: p.y, r: 0, life: 1 });
          }

        } else if (mode === 'bloom') {
          p.sway += 0.022;
          p.rot += p.vr;
          p.x += p.vx * 0.65 + Math.sin(p.sway) * 0.9 + windGuest(windGust);
          p.y += p.vy;
          ctx.save();
          ctx.globalAlpha = p.alpha * Math.min(1, p.y / 60);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, 0.5 + 0.5 * Math.abs(Math.sin(p.sway)));
          ctx.fillStyle = PETAL_COLORS[p.hue];
          ctx.shadowColor = PETAL_COLORS[p.hue];
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.52, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else {
          // layered snow
          p.sway += 0.008 + p.layer * 0.006;
          p.x += Math.sin(p.sway) * 0.6;
          p.y += p.vy;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = 'rgba(235,248,255,1)';
          if (p.size > 2.2) {
            // large flake: 6-arm star shape
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(t * 0.004 * p.layer);
            for (let arm = 0; arm < 6; arm++) {
              ctx.rotate(Math.PI / 3);
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(0, p.size * 1.4);
              ctx.lineWidth = p.size * 0.22;
              ctx.strokeStyle = `rgba(235,248,255,${p.alpha})`;
              ctx.stroke();
            }
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // respawn
        if (p.y > h + 30 || p.x > w + 60 || p.x < -60) Object.assign(p, spawn(false));
      }

      // ── draw splashes ──
      if (mode === 'rain') {
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          s.r += 1.8;
          s.life -= 0.055;
          if (s.life <= 0) { splashes.splice(i, 1); continue; }
          ctx.save();
          ctx.globalAlpha = s.life * 0.55;
          ctx.strokeStyle = 'rgba(180,215,255,0.9)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.r * 1.6, s.r * 0.55, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // ── lightning ──
      if (mode === 'rain' && !reduce && t > nextFlash && flash.current) {
        flash.current.animate(
          [{ opacity: 0 }, { opacity: 0.45 }, { opacity: 0.05 }, { opacity: 0.30 }, { opacity: 0.08 }, { opacity: 0 }],
          { duration: 800 }
        );
        nextFlash = t + 300 + Math.random() * 500;
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [mode]);

  return (
    <>
      <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
      <div ref={flash} className="pointer-events-none absolute inset-0 bg-white opacity-0" aria-hidden />
    </>
  );
}

// tiny helper to avoid typo in closure
function windGuest(g: number) { return g; }
