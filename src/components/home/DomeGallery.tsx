'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react';
import { imageFor } from '@/lib/scene';
import type { GalleryItem } from '@/lib/types';

type Tile = { key: string; item: GalleryItem; index: number; lat: number; lon: number };

const LATS = [-64, -48, -32, -16, 0, 16, 32, 48, 64];
const COLS_AT_EQUATOR = 22;

/**
 * Photo sphere: tiles are laid out on latitude rings of a 3D sphere that spins
 * on its own, can be dragged with mouse/touch (with inertia), and opens a
 * lightbox on click.
 */
export function DomeGallery({ items }: { items: GalleryItem[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(300);
  const [active, setActive] = useState<number | null>(null);
  const rot = useRef({ x: -8, y: 0, vx: 0, vy: 0.08, dragging: false, moved: 0, lastX: 0, lastY: 0, hover: false });

  const tiles = useMemo<Tile[]>(() => {
    const out: Tile[] = [];
    let n = 0;
    LATS.forEach((lat, row) => {
      const cols = Math.max(6, Math.round(COLS_AT_EQUATOR * Math.cos((lat * Math.PI) / 180)));
      for (let c = 0; c < cols; c++) {
        const index = (n * 7 + row * 3) % items.length; // spread repeats around the sphere
        out.push({ key: `${row}-${c}`, item: items[index], index, lat, lon: (360 / cols) * c + (row % 2) * (180 / cols) });
        n++;
      }
    });
    return out;
  }, [items]);

  const images = useMemo(() => items.map((it) => imageFor(it.image, it.scene, it.id + it.title)), [items]);

  useEffect(() => {
    const stage = stageRef.current!;
    const ro = new ResizeObserver(() => setRadius(Math.max(170, Math.min(stage.clientWidth * 0.36, 330))));
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const tick = () => {
      const r = rot.current;
      if (!r.dragging) {
        const auto = reduce ? 0 : r.hover ? 0.03 : 0.09;
        r.vy += (auto - r.vy) * 0.02; // ease back to the auto-spin speed
        r.vx *= 0.92;
        r.y += r.vy;
        r.x = Math.max(-28, Math.min(28, r.x + r.vx));
      }
      if (sphereRef.current) sphereRef.current.style.transform = `translateZ(${-radius}px) rotateX(${r.x}deg) rotateY(${r.y}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [radius]);

  const onPointerDown = (e: React.PointerEvent) => {
    const r = rot.current;
    r.dragging = true;
    r.moved = 0;
    r.lastX = e.clientX;
    r.lastY = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const r = rot.current;
    if (!r.dragging) return;
    const dx = e.clientX - r.lastX;
    const dy = e.clientY - r.lastY;
    r.lastX = e.clientX;
    r.lastY = e.clientY;
    r.moved += Math.abs(dx) + Math.abs(dy);
    r.vy = dx * 0.25;
    r.vx = -dy * 0.15;
    r.y += r.vy;
    r.x = Math.max(-28, Math.min(28, r.x + r.vx));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const r = rot.current;
    r.dragging = false;
    if (r.moved < 6) {
      // treat as a click on whatever tile is under the pointer
      const el = document.elementsFromPoint(e.clientX, e.clientY).find((n) => (n as HTMLElement).dataset?.galleryIndex);
      if (el) setActive(Number((el as HTMLElement).dataset.galleryIndex));
    }
  };

  const tileSize = (2 * Math.PI * radius) / COLS_AT_EQUATOR - 10;

  const step = useCallback((d: number) => setActive((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, step]);

  return (
    <>
      <div
        ref={stageRef}
        className="relative mx-auto h-[440px] w-full max-w-4xl cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-[600px]"
        style={{ perspective: `${radius * 3.2}px` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (rot.current.dragging = false)}
        onMouseEnter={() => (rot.current.hover = true)}
        onMouseLeave={() => (rot.current.hover = false)}
        aria-label="Destination photo sphere. Drag to rotate, click a photo to open it."
        role="region"
      >
        <div ref={sphereRef} className="preserve-3d absolute left-1/2 top-1/2 h-0 w-0">
          {tiles.map((t) => (
            <div
              key={t.key}
              data-gallery-index={t.index}
              className="backface-hidden absolute overflow-hidden rounded-[28%] shadow-[0_6px_18px_-6px_rgba(0,0,0,.4)] transition-[filter] duration-300 hover:brightness-110"
              style={{
                width: tileSize,
                height: tileSize,
                left: -tileSize / 2,
                top: -tileSize / 2,
                transform: `rotateY(${t.lon}deg) rotateX(${-t.lat}deg) translateZ(${radius}px)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[t.index]} alt="" className="pointer-events-none h-full w-full object-cover" loading="lazy" draggable={false} />
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/85 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
            <motion.figure key={active} initial={{ scale: 0.85, opacity: 0, rotateY: -20 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }} className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[active]} alt={items[active].title} className="aspect-[4/3] w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
                <p className="text-xl font-bold">{items[active].title}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-white/75">
                  <MapPin className="h-4 w-4" /> {items[active].location}, Bangladesh
                </p>
              </figcaption>
              <button onClick={() => setActive(null)} aria-label="Close" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60">
                <X className="h-5 w-5" />
              </button>
              <button onClick={() => step(-1)} aria-label="Previous" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => step(1)} aria-label="Next" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60">
                <ChevronRight className="h-5 w-5" />
              </button>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
