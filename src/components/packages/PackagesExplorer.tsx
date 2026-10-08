'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Category, Level } from '@/lib/types';
import { PackageFlipCard, type CardPackage } from './PackageFlipCard';

type Item = CardPackage & { categorySlug: string; region: string };
const LEVELS: Level[] = ['Beginner', 'Moderate', 'Challenging'];
const DURATIONS = [
  { id: 'day', label: '1 Day', test: (d: number) => d <= 1 },
  { id: 'short', label: '2–3 Days', test: (d: number) => d >= 2 && d <= 3 },
  { id: 'long', label: '4+ Days', test: (d: number) => d >= 4 },
];

export function PackagesExplorer({ items, categories }: { items: Item[]; categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const category = params.get('category') ?? 'all';
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [duration, setDuration] = useState('all');
  const [sort, setSort] = useState('popular');

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params);
    if (slug === 'all') next.delete('category');
    else next.set('category', slug);
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter(
      (p) =>
        (category === 'all' || p.categorySlug === category) &&
        (level === 'all' || p.level === level) &&
        (duration === 'all' || DURATIONS.find((d) => d.id === duration)!.test(p.durationDays)) &&
        (!q || `${p.title} ${p.region} ${p.shortDescription}`.toLowerCase().includes(q)),
    );
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'duration') list.sort((a, b) => a.durationDays - b.durationDays);
    return list;
  }, [items, category, level, duration, query, sort]);

  const active = category !== 'all' || level !== 'all' || duration !== 'all' || query;

  return (
    <div>
      <div className="card -mt-10 relative z-10 p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Sajek, Bandarban, beach, waterfall…" className="input pl-11" aria-label="Search packages" />
          </div>
          <select value={level} onChange={(e) => setLevel(e.target.value as Level | 'all')} className="input md:w-44" aria-label="Level">
            <option value="all">All levels</option>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="input md:w-40" aria-label="Duration">
            <option value="all">Any duration</option>
            {DURATIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input md:w-48" aria-label="Sort">
            <option value="popular">Most popular</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="duration">Shortest first</option>
          </select>
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          {[{ slug: 'all', title: 'All Packages' }, ...categories].map((c) => (
            <button key={c.slug} onClick={() => setCategory(c.slug)} className={`chip shrink-0 border transition ${category === c.slug ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 bg-white text-ink-soft hover:border-brand-300'}`}>
              {c.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-sm">
        <p className="flex items-center gap-2 text-ink-mute">
          <SlidersHorizontal className="h-4 w-4" /> Showing <b className="text-ink">{filtered.length}</b> of {items.length} packages
        </p>
        {active && (
          <button
            onClick={() => {
              setQuery('');
              setLevel('all');
              setDuration('all');
              setCategory('all');
            }}
            className="flex items-center gap-1 text-brand-600 hover:underline"
          >
            <X className="h-4 w-4" /> Clear filters
          </button>
        )}
      </div>

      <motion.div layout className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <motion.div key={p.slug} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.3 }}>
              <PackageFlipCard pkg={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {filtered.length === 0 && (
        <div className="card mt-6 p-12 text-center">
          <p className="text-lg font-bold">No packages found</p>
          <p className="mt-1 text-sm text-ink-mute">Try a different search, or contact us for a customized tour.</p>
        </div>
      )}
    </div>
  );
}
