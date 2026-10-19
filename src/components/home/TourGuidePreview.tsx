'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Navigation,
  ArrowRight,
  Compass,
  Clock,
  CreditCard,
  Shield,
  Bus,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { GUIDE_ORIGINS, GUIDE_DESTINATIONS, getTourRouteGuide } from '@/data/tourGuides';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { formatPrice } from '@/config/site';

export function TourGuidePreview() {
  const [fromId, setFromId] = useState('dhaka');
  const [toId, setToId] = useState('sajek');

  const guide = getTourRouteGuide(fromId, toId);
  const destMeta = GUIDE_DESTINATIONS.find((d) => d.id === toId) || GUIDE_DESTINATIONS[0];
  const origMeta = GUIDE_ORIGINS.find((o) => o.id === fromId) || GUIDE_ORIGINS[0];

  const minBudget = guide.costCategories.reduce((acc, c) => acc + c.budget, 0);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Soft Gradients */}
      <div className="pointer-events-none absolute -left-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="container max-w-[1400px]">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge icon={<Compass className="h-3.5 w-3.5 text-brand-600" />}>
            ROUTE & TRANSIT PLANNER
          </SectionBadge>
          <h2 className="section-title mt-3">
            Plan From Origin to Destination <br />
            <span className="accent">A to Z Tour & Transit Guide</span>
          </h2>
          <p className="mt-3 text-sm text-ink-soft sm:text-base leading-relaxed">
            Curious how to reach Sajek, Saint Martin or Bandarban? Check step-by-step bus, train, Chander Gari and convoy schedules with instant cost calculations.
          </p>
        </div>

        {/* Interactive Preview Container */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/5">
          {/* Top Selector Bar */}
          <div className="border-b border-slate-100 bg-slate-50/70 p-5 sm:p-7">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto] items-center">
              {/* Origin Dropdown */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Starting From
                </label>
                <select
                  value={fromId}
                  onChange={(e) => setFromId(e.target.value)}
                  className="input mt-1.5 font-bold text-ink bg-white shadow-sm"
                >
                  {GUIDE_ORIGINS.map((orig) => (
                    <option key={orig.id} value={orig.id}>
                      {orig.name} (Gateway)
                    </option>
                  ))}
                </select>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center pt-5">
                <div className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-brand-600 shadow-sm">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {/* Destination Dropdown */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft">
                  <Navigation className="h-3.5 w-3.5 text-brand-500" /> Destination
                </label>
                <select
                  value={toId}
                  onChange={(e) => setToId(e.target.value)}
                  className="input mt-1.5 font-bold text-ink bg-white shadow-sm"
                >
                  {GUIDE_DESTINATIONS.map((dest) => (
                    <option key={dest.id} value={dest.id}>
                      {dest.name} — {dest.tagline}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Button */}
              <div className="pt-2 md:pt-5">
                <Link
                  href={`/tour-guide?from=${fromId}&to=${toId}`}
                  className="btn-primary w-full md:w-auto py-3.5 px-6 text-xs font-extrabold shadow-md shadow-brand-500/20"
                >
                  <span>Explore A-Z Guide</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Body Content Preview */}
          <div className="grid lg:grid-cols-12 gap-8 p-6 sm:p-8 items-center">
            {/* Left Snapshot Info */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip bg-brand-50 text-brand-600 font-extrabold text-[11px] uppercase tracking-wide">
                  Route Corridor
                </span>
                <span className="chip bg-emerald-50 text-emerald-600 font-semibold text-[11px]">
                  {guide.totalDistanceKm} Kilometers
                </span>
                <span className="chip bg-amber-50 text-amber-700 font-semibold text-[11px]">
                  <Clock className="h-3 w-3" /> {guide.totalDurationHours}
                </span>
              </div>

              <h3 className="font-display text-2xl font-black text-ink sm:text-3xl">
                {guide.routeTitle}
              </h3>

              <p className="text-sm text-ink-soft leading-relaxed">
                {guide.routeSummary}
              </p>

              {/* Mini Stops Flow */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-mute mb-3">
                  Key Transit Waypoints:
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {guide.waypoints.map((wp, idx) => (
                    <div key={wp.id} className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 font-semibold text-slate-800 shadow-xs">
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[9px] font-black text-white">
                          {idx + 1}
                        </span>
                        <span>{wp.name.split('(')[0]}</span>
                      </span>
                      {idx < guide.waypoints.length - 1 && (
                        <span className="text-slate-400 font-bold">➔</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Perks */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 pt-2">
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <span className="text-[11px] text-ink-mute">Est. Budget</span>
                  <p className="text-base font-extrabold text-emerald-600">
                    From {formatPrice(minBudget)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <span className="text-[11px] text-ink-mute">Convoy / Ferry</span>
                  <p className="text-sm font-bold text-ink">
                    {guide.transitSteps.some((s) => s.mode === 'convoy')
                      ? 'Military Escort'
                      : guide.transitSteps.some((s) => s.mode === 'ship')
                      ? 'Bay Cruise Liner'
                      : 'Highway Express'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-ink-mute">Recommended</span>
                  <p className="text-sm font-bold text-brand-600">
                    {guide.recommendedDays} Days Trip
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: Full Guide Banner & Tourigo Package */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 text-white shadow-xl">
                <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brand-500/20 blur-2xl" />

                <div className="relative z-10">
                  <span className="chip bg-brand-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    A to Z Tour Guide System
                  </span>
                  <h4 className="mt-3 text-xl font-black text-white">
                    Need the complete step-by-step breakdown?
                  </h4>
                  <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>Verified Bus & Train counter contacts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>Military convoy & ship departure hours</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>Interactive group budget & cost calculator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>SIM network reality & ATM location alerts</span>
                    </li>
                  </ul>

                  <div className="mt-6 flex flex-col gap-2.5">
                    <Link
                      href={`/tour-guide?from=${fromId}&to=${toId}`}
                      className="btn-primary w-full py-3 text-xs font-extrabold text-center shadow-lg shadow-brand-500/30"
                    >
                      <span>Open Full Interactive Route Guide</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    {destMeta.packageSlug && (
                      <Link
                        href={`/packages/${destMeta.packageSlug}`}
                        className="btn-ghost w-full py-2.5 text-xs font-bold text-center text-slate-300 hover:text-white border-white/20 bg-white/10 hover:bg-white/20"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>Or Book All-Inclusive Package</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
