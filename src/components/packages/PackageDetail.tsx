'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Backpack, Bed, Calendar, CalendarDays, Check, CheckCircle2, Clock, Compass, Flame, HelpCircle, Info, ListChecks, MapPin, Minus, Plus, ShieldCheck, Sparkles, Utensils, X } from 'lucide-react';
import { formatPrice } from '@/config/site';
import { formatRange, tripDayLabel } from '@/lib/dates';
import type { Package } from '@/lib/types';
import { AccordionItem } from '@/components/ui/Accordion';
import { BookingModal } from './BookingModal';

const TABS = [
  { id: 'overview', label: 'Overview', Icon: Compass },
  { id: 'itinerary', label: 'Itinerary', Icon: Calendar },
  { id: 'map', label: 'Route Map', Icon: MapPin },
  { id: 'amenities', label: 'Amenities & Gear', Icon: Backpack },
  { id: 'faqs', label: 'FAQs & Policies', Icon: HelpCircle },
] as const;
type TabId = (typeof TABS)[number]['id'];

const MAX_TRAVELERS = 12;

export function PackageDetail({ pkg }: { pkg: Package }) {
  const [tab, setTab] = useState<TabId>('overview');
  const firstOpen = pkg.batches.find((b) => b.seatsLeft > 0) ?? pkg.batches[0];
  const [batchId, setBatchId] = useState(firstOpen?.id ?? '');
  const [travelers, setTravelers] = useState(2);
  const [modal, setModal] = useState(false);
  const batch = pkg.batches.find((b) => b.id === batchId);
  const maxForBatch = Math.min(MAX_TRAVELERS, batch?.seatsLeft ?? MAX_TRAVELERS);
  const unitPrice = batch?.price ?? pkg.price;
  const save = Math.max(0, pkg.originalPrice - pkg.price);

  return (
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0">
        {/* tabs */}
        <div className="card sticky top-[calc(var(--header-h)+52px)] z-20 p-1.5">
          <div className="no-scrollbar flex gap-1 overflow-x-auto" role="tablist">
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`relative flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition sm:text-[13px] ${tab === id ? 'text-white' : 'text-ink-soft hover:bg-slate-50'}`}>
                {tab === id && <motion.span layoutId="pkg-tab" className="absolute inset-0 rounded-xl bg-brand-500 shadow-md shadow-brand-500/30" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="card mt-4 p-5 sm:p-7">
            {tab === 'overview' && <Overview pkg={pkg} />}
            {tab === 'itinerary' && <Itinerary pkg={pkg} startDate={batch?.startDate} />}
            {tab === 'map' && <RouteMap pkg={pkg} />}
            {tab === 'amenities' && <Amenities pkg={pkg} />}
            {tab === 'faqs' && <FaqsPolicies pkg={pkg} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* booking card */}
      <aside className="card sticky top-[calc(var(--header-h)+60px)] p-5">
        <div className="flex items-center justify-between">
          <span className="chip bg-emerald-50 text-[10px] uppercase tracking-wide text-emerald-600">Best Price Guaranteed</span>
          {save > 0 && <span className="chip bg-rose-50 text-[10px] text-rose-500">Save {formatPrice(save)}</span>}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-4xl font-extrabold text-brand-500">{formatPrice(unitPrice)}</span>
          {pkg.originalPrice > unitPrice && <span className="text-sm text-slate-400 line-through">{formatPrice(pkg.originalPrice)}</span>}
          <span className="text-xs text-ink-mute">/ person</span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
            <CalendarDays className="h-3.5 w-3.5" /> Select Departure Batch
          </p>
          <span className="chip bg-brand-50 text-[10px] text-brand-600">
            {pkg.batches.length} Batch{pkg.batches.length === 1 ? '' : 'es'}
          </span>
        </div>
        <div className="mt-2 space-y-2">
          {pkg.batches.map((b) => {
            const selected = b.id === batchId;
            const soldOut = b.seatsLeft <= 0;
            const filling = !soldOut && b.seatsLeft <= 5;
            return (
              <button
                key={b.id}
                disabled={soldOut}
                onClick={() => {
                  setBatchId(b.id);
                  setTravelers((t) => Math.min(t, Math.max(1, b.seatsLeft)));
                }}
                className={`w-full rounded-xl border p-3 text-left transition ${selected ? 'border-brand-400 bg-brand-50/60 ring-4 ring-brand-100' : 'border-slate-200 hover:border-brand-200'} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-ink">
                    <Calendar className="h-3.5 w-3.5 text-ink-mute" /> {formatRange(b.startDate, b.endDate)}
                  </span>
                  <span className="text-brand-600">{formatPrice(b.price)}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <span className="uppercase tracking-wide text-ink-mute">{selected ? 'Selected' : 'Available'}</span>
                  {soldOut ? (
                    <span className="chip bg-slate-100 text-[10px] text-slate-500">Sold out</span>
                  ) : filling ? (
                    <span className="chip bg-amber-50 text-[10px] text-amber-600">
                      <Flame className="h-3 w-3" /> Filling fast ({b.seatsLeft} left)
                    </span>
                  ) : (
                    <span className="chip bg-emerald-50 text-[10px] text-emerald-600">
                      <Check className="h-3 w-3" /> {b.seatsLeft} slots left
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {pkg.batches.length === 0 && <p className="rounded-xl bg-slate-50 p-3 text-xs text-ink-mute">New dates coming soon — contact us to request a private departure.</p>}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Number of Travellers</p>
          <span className="text-[10px] text-ink-mute">Max {maxForBatch} slots</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
          <span className="text-sm text-ink-soft">Travellers</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setTravelers((t) => Math.max(1, t - 1))} aria-label="Fewer travellers" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-ink-soft hover:border-brand-300 disabled:opacity-40" disabled={travelers <= 1}>
              <Minus className="h-4 w-4" />
            </button>
            <motion.span key={travelers} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-5 text-center font-bold">
              {travelers}
            </motion.span>
            <button onClick={() => setTravelers((t) => Math.min(maxForBatch, t + 1))} aria-label="More travellers" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-ink-soft hover:border-brand-300 disabled:opacity-40" disabled={travelers >= maxForBatch}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
          <span className="text-sm text-ink-mute">Estimated Total</span>
          <span className="font-display text-2xl font-bold text-brand-500">{formatPrice(unitPrice * travelers)}</span>
        </div>
        <button className="btn-primary mt-4 w-full py-3.5" disabled={!batch || batch.seatsLeft <= 0} onClick={() => setModal(true)}>
          Proceed to Book ({travelers} Traveller{travelers > 1 ? 's' : ''})
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink-mute">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> No payment now — we confirm by phone
        </p>
      </aside>

      <AnimatePresence>{modal && batch && <BookingModal pkg={pkg} batch={batch} travelers={travelers} onClose={() => setModal(false)} />}</AnimatePresence>
    </div>
  );
}

function H({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
      {icon}
      {children}
    </h2>
  );
}

function Overview({ pkg }: { pkg: Package }) {
  return (
    <div>
      <H>About This Adventure</H>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
        {pkg.overview.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Duration', value: `${pkg.durationDays}D${pkg.durationNights ? ` / ${pkg.durationNights}N` : ''}` },
          { label: 'Level', value: pkg.level },
          { label: 'Altitude', value: pkg.altitude ?? 'N/A' },
          { label: 'Region', value: pkg.region },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] uppercase tracking-wide text-ink-mute">{s.label}</p>
            <p className="mt-1 text-sm font-bold text-ink">{s.value}</p>
          </div>
        ))}
      </div>
      <h3 className="mt-7 flex items-center gap-2 font-bold">
        <Sparkles className="h-4 w-4 text-accent-500" /> Trip Highlights
      </h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {pkg.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2 rounded-xl border border-slate-100 p-3 text-sm text-ink-soft">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {h}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Itinerary({ pkg, startDate }: { pkg: Package; startDate?: string }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set([pkg.itinerary[0]?.day]));
  const allOpen = open.size === pkg.itinerary.length;
  const toggle = (d: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(d)) n.delete(d);
      else n.add(d);
      return n;
    });
  const firstDay = pkg.itinerary[0]?.day ?? 1;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <H icon={<ListChecks className="h-5 w-5 text-brand-500" />}>Day-by-Day Itinerary</H>
          <p className="mt-1 text-xs text-ink-mute">
            Detailed breakdown across {pkg.durationDays} day{pkg.durationDays > 1 ? 's' : ''} {startDate && <span className="ml-1 rounded bg-brand-50 px-1.5 py-0.5 text-brand-600">Batch dates applied</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button className={`chip border ${allOpen ? 'border-brand-200 bg-brand-50 text-brand-600' : 'border-slate-200 text-ink-soft'}`} onClick={() => setOpen(new Set(pkg.itinerary.map((d) => d.day)))}>
            Expand All
          </button>
          <button className="chip border border-slate-200 text-ink-soft" onClick={() => setOpen(new Set())}>
            Collapse All
          </button>
        </div>
      </div>
      <ol className="relative mt-6 space-y-4 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-0.5 before:bg-gradient-to-b before:from-brand-400 before:to-brand-100">
        {pkg.itinerary.map((d) => {
          const isOpen = open.has(d.day);
          return (
            <li key={d.day} className="relative pl-14">
              <span className={`absolute left-0 top-2 grid h-10 w-10 place-items-center rounded-full border-2 text-xs font-bold transition ${isOpen ? 'border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'border-brand-200 bg-white text-brand-600'}`}>
                D{d.day}
              </span>
              <div className="rounded-2xl border border-slate-100 bg-white">
                <button onClick={() => toggle(d.day)} className="flex w-full items-center justify-between gap-3 p-4 text-left" aria-expanded={isOpen}>
                  <div>
                    <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-brand-600">
                      Day {d.day}
                      {startDate && <span>• {tripDayLabel(startDate, d.day - firstDay)}</span>}
                      {d.duration && (
                        <span className="flex items-center gap-1 text-ink-mute">
                          <Clock className="h-3 w-3" /> {d.duration}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 font-bold text-ink">{d.title}</p>
                  </div>
                  <Plus className={`h-4 w-4 shrink-0 text-ink-mute transition-transform ${isOpen ? 'rotate-45 text-brand-500' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                        <ul className="space-y-2.5">
                          {d.items.map((it, k) => (
                            <li key={k} className="flex gap-3 text-sm text-ink-soft">
                              {it.time && <span className="w-20 shrink-0 font-semibold text-ink">{it.time}</span>}
                              <span>{it.text}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {d.stay && (
                            <span className="chip bg-slate-50 text-ink-soft">
                              <Bed className="h-3.5 w-3.5" /> {d.stay}
                            </span>
                          )}
                          {d.meals && (
                            <span className="chip bg-slate-50 text-ink-soft">
                              <Utensils className="h-3.5 w-3.5" /> {d.meals}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function RouteMap({ pkg }: { pkg: Package }) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(pkg.mapQuery)}&z=10&output=embed`;
  return (
    <div>
      <H icon={<MapPin className="h-5 w-5 text-brand-500" />}>Route Map</H>
      <p className="mt-1 text-xs text-ink-mute">{pkg.mapQuery}</p>
      <div className="mt-4 aspect-[16/10] overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
        <iframe title={`Map of ${pkg.title}`} src={src} className="h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
      <h3 className="mt-6 font-bold">Pickup Points</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {pkg.pickupPoints.map((p) => (
          <li key={p.id} className="rounded-xl border border-slate-100 p-3 text-sm">
            <p className="font-semibold text-ink">{p.name}</p>
            <p className="text-xs text-ink-mute">
              {p.detail} • {p.time}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Amenities({ pkg }: { pkg: Package }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <H>What’s Included</H>
        <ul className="mt-3 space-y-2">
          {pkg.inclusions.map((x) => (
            <li key={x} className="flex gap-2 text-sm text-ink-soft">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {x}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <H>Not Included</H>
        <ul className="mt-3 space-y-2">
          {pkg.exclusions.map((x) => (
            <li key={x} className="flex gap-2 text-sm text-ink-soft">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" /> {x}
            </li>
          ))}
        </ul>
      </div>
      <div className="md:col-span-2">
        <H icon={<Backpack className="h-5 w-5 text-brand-500" />}>Things to Carry</H>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {pkg.thingsToCarry.map((x) => (
            <li key={x} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> {x}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FaqsPolicies({ pkg }: { pkg: Package }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = useMemo(() => pkg.faqs, [pkg.faqs]);
  return (
    <div>
      <H>Frequently Asked Questions</H>
      <div className="mt-4 space-y-2.5">
        {items.map((f, i) => (
          <AccordionItem key={i} open={open === i} onToggle={() => setOpen(open === i ? null : i)} title={`${i + 1}. ${f.question}`}>
            {f.answer}
          </AccordionItem>
        ))}
      </div>
      <h3 className="mt-8 flex items-center gap-2 text-lg font-bold">
        <Info className="h-5 w-5 text-brand-500" /> Policies
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {pkg.policies.map((p) => (
          <div key={p.title} className="rounded-xl border border-slate-100 p-4">
            <p className="font-semibold text-ink">{p.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-mute">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
