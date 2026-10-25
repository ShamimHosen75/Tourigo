'use client';

import { useState, useId, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ArrowRight,
  Navigation,
  Compass,
  Bus,
  Train,
  Plane,
  Car,
  Clock,
  Shield,
  AlertTriangle,
  Smartphone,
  CreditCard,
  Luggage,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  PhoneCall,
  Calendar,
  UtensilsCrossed,
} from 'lucide-react';
import {
  getLocalizedTourRouteGuide,
  getLocalizedOrigins,
  getLocalizedDestinations,
} from '@/data/localizedTourGuides';
import { RouteMapVisualizer } from './RouteMapVisualizer';
import { TourGuideCostCalculator } from './TourGuideCostCalculator';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Props {
  initialOrigin?: string;
  initialDestination?: string;
}

export function TourGuideExplorer({
  initialOrigin = 'dhaka',
  initialDestination = 'sajek',
}: Props) {
  const { t, locale, formatPrice, formatNumber } = useLanguage();
  const [originId, setOriginId] = useState<string>(initialOrigin);
  const [destId, setDestId] = useState<string>(initialDestination);
  const [activeTab, setActiveTab] = useState<'map' | 'transit' | 'cost' | 'intel' | 'faqs'>('map');

  const originSelectId = useId();
  const destSelectId = useId();

  const origins = useMemo(() => getLocalizedOrigins(locale), [locale]);
  const destinations = useMemo(() => getLocalizedDestinations(locale), [locale]);

  const currentGuide = useMemo(
    () => getLocalizedTourRouteGuide(originId, destId, locale),
    [originId, destId, locale]
  );
  const destinationMeta = destinations.find((d) => d.id === destId) || destinations[0];
  const originMeta = origins.find((o) => o.id === originId) || origins[0];

  // Locale-aware popular presets
  const rawPresets = t('tourGuideExplorer.presets', null);
  const POPULAR_PRESETS = [
    { from: 'dhaka',      to: 'sajek',       label: rawPresets?.[0]?.label ?? 'Dhaka → Sajek Valley',    badge: rawPresets?.[0]?.badge ?? 'Cloud Kingdom' },
    { from: 'dhaka',      to: 'saint-martin',label: rawPresets?.[1]?.label ?? "Dhaka → Saint Martin's",  badge: rawPresets?.[1]?.badge ?? 'Coral Island' },
    { from: 'dhaka',      to: 'coxs-bazar',  label: rawPresets?.[2]?.label ?? "Dhaka → Cox's Bazar",     badge: rawPresets?.[2]?.badge ?? '120km Beach' },
    { from: 'dhaka',      to: 'bandarban',   label: rawPresets?.[3]?.label ?? 'Dhaka → Bandarban',       badge: rawPresets?.[3]?.badge ?? 'Adventure Trek' },
    { from: 'chattogram', to: 'sajek',        label: rawPresets?.[4]?.label ?? 'Chattogram → Sajek',      badge: rawPresets?.[4]?.badge ?? 'Fastest Route' },
    { from: 'sylhet',     to: 'sreemangal',  label: rawPresets?.[5]?.label ?? 'Sylhet → Sreemangal',    badge: rawPresets?.[5]?.badge ?? 'Tea Gardens' },
  ];

  return (
    <div className="space-y-10">
      {/* ─── Hero Origin & Destination Route Selector ─── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-cyan-50/20 to-amber-50/20 p-6 shadow-xl shadow-slate-900/5 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1.5 text-xs font-bold text-brand-700">
            <Compass className="h-3.5 w-3.5 text-brand-600" />
            <span>{t('tourGuideExplorer.masterBadge', 'A to Z Tour Guide & Transit Master System')}</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl md:text-5xl">
            {t('tourGuideExplorer.heroTitle', 'From Location to Destination')} <br />
            <span className="accent bg-gradient-to-r from-brand-600 via-cyan-600 to-amber-500 bg-clip-text text-transparent">
              {t('tourGuideExplorer.heroTitleAccent', 'Complete Transit & Cost Guide')}
            </span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
            {t('tourGuideExplorer.heroDesc', 'Select your starting city and destination to explore verified step-by-step transportation routes, bus & train schedules, military convoy timings, and an interactive budget calculator.')}
          </p>
        </div>

        {/* Origin / Destination Pickers Card */}
        <div className="relative z-10 mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-brand-500/5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
            {/* From Origin */}
            <div>
              <label htmlFor={originSelectId} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" /> {t('tourGuideExplorer.fromLabel', 'From (Origin City)')}
              </label>
              <select
                id={originSelectId}
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="input mt-2 font-bold text-ink"
              >
                {origins.map((orig) => (
                  <option key={orig.id} value={orig.id}>
                    {orig.name} ({orig.departureHubs.slice(0, 2).join(', ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Middle Switch / Arrow Indicator */}
            <div className="flex items-center justify-center md:pt-6">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-slate-50 text-brand-600 shadow-sm">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* To Destination */}
            <div>
              <label htmlFor={destSelectId} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft">
                <Navigation className="h-3.5 w-3.5 text-brand-500" /> {t('tourGuideExplorer.toLabel', 'To (Destination)')}
              </label>
              <select
                id={destSelectId}
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="input mt-2 font-bold text-ink"
              >
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name} — {dest.tagline}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Popular Route Presets Chips */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
              {t('tourGuideExplorer.popularShortcuts', 'Popular Route Shortcuts:')}
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {POPULAR_PRESETS.map((p) => {
                const isActive = originId === p.from && destId === p.to;
                return (
                  <button
                    key={`${p.from}-${p.to}`}
                    onClick={() => {
                      setOriginId(p.from);
                      setDestId(p.to);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="chip bg-slate-100 text-[10px] text-ink-soft font-normal">
                      {p.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Route Summary Strip ─── */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50/80 via-white to-amber-50/80 p-5 sm:px-7">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip bg-brand-600 text-white text-[11px] font-extrabold uppercase tracking-wide">
              {t('tourGuideExplorer.selectedRoute', 'Selected Route')}
            </span>
            <span className="text-xs font-bold text-ink-mute">
              {originMeta.name} ➔ {destinationMeta.name}
            </span>
          </div>
          <h2 className="mt-1 text-xl font-black text-ink sm:text-2xl">
            {currentGuide.routeTitle}
          </h2>
          <p className="mt-0.5 text-xs text-ink-soft max-w-3xl leading-relaxed">
            {currentGuide.routeSummary}
          </p>
        </div>

        {destinationMeta.packageSlug && (
          <Link
            href={`/packages/${destinationMeta.packageSlug}`}
            className="btn-primary py-2.5 px-5 text-xs shadow-md shadow-brand-500/20 shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('tourGuideExplorer.bookGuided', 'Book Guided Package')}</span>
          </Link>
        )}
      </section>

      {/* ─── Navigation Tabs for Guide Sections ─── */}
      <div className="sticky top-[calc(var(--header-h)+8px)] z-20 rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-md backdrop-blur">
        <div className="no-scrollbar flex gap-1 overflow-x-auto" role="tablist">
          {[
            { id: 'map',     label: t('tourGuideExplorer.tabMap',     'Route Map & Stops'),             icon: MapPin },
            { id: 'transit', label: t('tourGuideExplorer.tabTransit', 'A-Z Transit Roadmap'),           icon: Bus },
            { id: 'cost',    label: t('tourGuideExplorer.tabCost',    'Cost Breakdown & Calculator'),   icon: CreditCard },
            { id: 'intel',   label: t('tourGuideExplorer.tabIntel',   'Survival & Travel Intel'),       icon: Smartphone },
            { id: 'faqs',    label: t('tourGuideExplorer.tabFaqs',    'Route FAQs'),                    icon: HelpCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id as any)}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
                activeTab === id ? 'text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
              }`}
            >
              {activeTab === id && (
                <motion.span
                  layoutId="guide-tab-pill"
                  className="absolute inset-0 rounded-xl bg-brand-500 shadow-md shadow-brand-500/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab 1: Route Map Visualizer ─── */}
      {activeTab === 'map' && (
        <section className="space-y-6">
          <RouteMapVisualizer guide={currentGuide} />
        </section>
      )}

      {/* ─── Tab 2: Step-by-Step Transit Process ─── */}
      {activeTab === 'transit' && (
        <section className="space-y-8">
          {/* Timeline of Steps */}
          <div className="card p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-ink sm:text-xl">
                  {t('tourGuideExplorer.transitTitle', 'Step-by-Step Transit Process (How to Reach)')}
                </h3>
                <p className="text-xs text-ink-mute">
                  {t('tourGuideExplorer.transitDesc', 'Detailed roadmap covering every leg, transit vehicles, departure counters, and military or ferry schedules.')}
                </p>
              </div>
            </div>

            <ol className="relative mt-8 space-y-6 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-0.5 before:bg-gradient-to-b before:from-brand-500 via-cyan-400 to-rose-400">
              {currentGuide.transitSteps.map((step) => (
                <li key={step.stepNumber} className="relative pl-14">
                  {/* Step Badge */}
                  <span className="absolute left-0 top-1 grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 text-xs font-black text-white shadow-md shadow-brand-500/30">
                    #{step.stepNumber}
                  </span>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 sm:p-6 transition hover:bg-white hover:shadow-md">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="chip bg-white border border-slate-200 text-ink font-bold text-[11px]">
                            {step.from} ➔ {step.to}
                          </span>
                          <span className="chip bg-brand-50 text-brand-600 font-semibold text-[11px]">
                            <Clock className="h-3 w-3" /> {step.duration}
                          </span>
                          {step.distanceKm && (
                            <span className="chip bg-slate-100 text-ink-soft text-[11px]">
                              {formatNumber(step.distanceKm)} {t('common.km', 'km')}
                            </span>
                          )}
                        </div>
                        <h4 className="mt-2 text-base font-extrabold text-ink sm:text-lg">
                          {step.title}
                        </h4>
                      </div>

                      {/* Estimated Fare for this leg */}
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-right sm:min-w-[160px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">{t('tourGuideExplorer.legFare', 'Leg Fare')}</span>
                        <p className="text-sm font-extrabold text-emerald-600">
                          {formatPrice(step.costEstimate.budget)} – {formatPrice(step.costEstimate.standard)}
                        </p>
                      </div>
                    </div>

                    {/* Timing note alert */}
                    {step.timingNotes && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-2.5 text-xs text-blue-800">
                        <Clock className="h-4 w-4 shrink-0 text-blue-600" />
                        <span><strong>{t('tourGuideExplorer.scheduleLabel', 'Schedule Timing:')}</strong> {step.timingNotes}</span>
                      </div>
                    )}

                    {/* Warning alert */}
                    {step.warnings && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                        <span><strong>{t('tourGuideExplorer.cautionLabel', 'Important Caution:')}</strong> {step.warnings}</span>
                      </div>
                    )}

                    {/* Instructions list */}
                    <ul className="mt-4 space-y-2">
                      {step.instructions.map((inst, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-ink-soft leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Verified Counters / Operators */}
                    {step.countersOrStations && step.countersOrStations.length > 0 && (
                      <div className="mt-4 border-t border-slate-200/60 pt-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                          {t('tourGuideExplorer.recommendedOps', 'Recommended Operators & Counters:')}
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {step.countersOrStations.map((counter, idx) => (
                            <span key={idx} className="chip bg-white border border-slate-200 text-slate-700 text-[11px]">
                              {counter}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Transit Modes Comparison Table */}
          <div className="card p-6 sm:p-8">
            <h3 className="text-lg font-black text-ink sm:text-xl">
              {t('tourGuideExplorer.transitOptions', 'Transportation Options Comparison')}
            </h3>
            <p className="mt-1 text-xs text-ink-mute">
              {t('tourGuideExplorer.transitOptionsDesc', 'Compare speed, ticket costs, schedule frequencies, and comfort levels across available transit modes.')}
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {currentGuide.transitOptions.map((opt, i) => (
                <div key={i} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="chip bg-brand-50 text-brand-600 font-bold text-[10px] uppercase tracking-wider">
                      {opt.mode}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">{opt.ticketPriceRange}</span>
                  </div>
                  <h4 className="mt-3 font-extrabold text-ink">{opt.name}</h4>
                  <div className="mt-2 flex items-center gap-3 text-xs text-ink-soft">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-brand-500" /> {opt.travelTime}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-ink-mute leading-relaxed">{opt.schedule}</p>

                  <div className="mt-4 space-y-1.5 text-xs">
                    <p className="font-bold text-emerald-700">{t('tourGuideExplorer.advantages', 'Advantages:')}</p>
                    {opt.pros.map((p, idx) => (
                      <p key={idx} className="text-ink-soft text-[11px] flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold">✓</span> {p}
                      </p>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-50 p-2 text-[11px] text-ink-soft">
                    <strong>{t('tourGuideExplorer.bestFor', 'Best For:')}</strong> {opt.recommendedFor}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Tab 3: Dynamic Cost Breakdown & Calculator ─── */}
      {activeTab === 'cost' && (
        <section className="space-y-6">
          <TourGuideCostCalculator guide={currentGuide} />
        </section>
      )}

      {/* ─── Tab 4: Survival & Practical Travel Intel ─── */}
      {activeTab === 'intel' && (
        <section className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Mobile Network Signal Matrix */}
            <div className="card p-6">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-ink">{t('tourGuideExplorer.networkTitle', 'Mobile Network & SIM Reality')}</h3>
                  <p className="text-xs text-ink-mute">{t('tourGuideExplorer.networkDesc', 'Signal availability across hill tracts & islands')}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { op: 'Teletalk', stat: currentGuide.travelIntel.networkCoverage.teletalk, color: 'text-emerald-600' },
                  { op: 'Robi / Airtel', stat: currentGuide.travelIntel.networkCoverage.robi, color: 'text-amber-600' },
                  { op: 'Grameenphone', stat: currentGuide.travelIntel.networkCoverage.grameenphone, color: 'text-blue-600' },
                  { op: 'Banglalink', stat: currentGuide.travelIntel.networkCoverage.banglalink, color: 'text-rose-600' },
                ].map((n) => (
                  <div key={n.op} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                    <p className={`font-bold ${n.color}`}>{n.op}</p>
                    <p className="mt-0.5 text-ink-soft">{n.stat}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ATM & Cash Availability */}
            <div className="card p-6">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-ink">{t('tourGuideExplorer.cashTitle', 'Cash & ATM Alert')}</h3>
                  <p className="text-xs text-ink-mute">{t('tourGuideExplorer.cashDesc', 'Important currency & payment notice')}</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 leading-relaxed">
                <p className="font-extrabold text-sm text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" /> {t('tourGuideExplorer.cashEssential', 'Cash is Essential')}
                </p>
                <p className="mt-2">{currentGuide.travelIntel.atmStatus}</p>
              </div>

              {/* Best Season */}
              <div className="mt-5 space-y-2">
                <div className="rounded-xl border border-slate-100 bg-white p-3 text-xs">
                  <span className="font-bold text-ink">{t('tourGuideExplorer.bestTime', 'Best Time to Visit:')}</span>
                  <p className="mt-0.5 text-ink-soft">{currentGuide.travelIntel.bestTimeToVisit}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3 text-xs">
                  <span className="font-bold text-ink">{t('tourGuideExplorer.peakSeason', 'Peak Season:')}</span>
                  <p className="mt-0.5 text-ink-soft">{currentGuide.travelIntel.peakSeason}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Permits, NID and Packing List */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Permits & Legal Guidelines */}
            <div className="card p-6">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-ink">{t('tourGuideExplorer.permitsTitle', 'Permits & Mandatory NID')}</h3>
                  <p className="text-xs text-ink-mute">{t('tourGuideExplorer.permitsDesc', 'Army checkposts & local registrations')}</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5 text-xs text-ink-soft">
                {currentGuide.travelIntel.permitsAndNid.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-500 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Packing Checklist */}
            <div className="card p-6">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Luggage className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-ink">{t('tourGuideExplorer.packingTitle', 'What to Pack (A to Z Gear)')}</h3>
                  <p className="text-xs text-ink-mute">{t('tourGuideExplorer.packingDesc', 'Essential items you must carry')}</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2 text-xs text-ink-soft">
                {currentGuide.travelIntel.packingList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Local Delicacies Feast */}
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-ink">{t('tourGuideExplorer.delicaciesTitle', 'Must-Try Culinary Delicacies')}</h3>
                <p className="text-xs text-ink-mute">{t('tourGuideExplorer.delicaciesDesc', 'Authentic local dishes and estimated prices')}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {currentGuide.travelIntel.localDelicacies.map((dish, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="font-extrabold text-ink text-sm">{dish.name}</p>
                  <p className="mt-1 text-xs text-ink-soft leading-relaxed">{dish.desc}</p>
                  <span className="mt-3 inline-block rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-brand-600">
                    {dish.approxPrice}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Tab 5: Route FAQs ─── */}
      {activeTab === 'faqs' && (
        <section className="card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-ink">{t('tourGuideExplorer.faqTitle', 'Frequently Asked Questions')}</h3>
              <p className="text-xs text-ink-mute">{t('tourGuideExplorer.faqDesc', 'Common inquiries for the')} {currentGuide.routeTitle}</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {currentGuide.faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5">
                <h4 className="font-extrabold text-ink text-sm sm:text-base">{faq.question}</h4>
                <p className="mt-2 text-xs text-ink-soft leading-relaxed sm:text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── CTA Footer: Guided Tourigo Package ─── */}
      <section className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-600 via-brand-500 to-cyan-600 p-8 text-white shadow-xl shadow-brand-500/20 sm:p-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <span className="chip bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider">
              {t('tourGuideExplorer.ctaBadge', 'Zero Stress Travel')}
            </span>
            <h3 className="mt-3 font-display text-2xl font-black sm:text-3xl">
              {t('tourGuideExplorer.ctaTitle', 'Prefer a 100% Hassle-Free Guided Experience?')}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-cyan-50 leading-relaxed">
              {t('tourGuideExplorer.ctaDesc', 'Skip booking multiple separate buses, negotiating jeep rentals at counters, and guessing military escort hours. Tourigo takes care of AC transport, mountain jeeps, prime ridge resorts, all meals, and experienced trek leaders.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {destinationMeta.packageSlug ? (
              <Link
                href={`/packages/${destinationMeta.packageSlug}`}
                className="btn-ghost bg-white text-brand-600 hover:bg-slate-100 px-6 py-3.5 text-sm font-extrabold shadow-lg"
              >
                <span>{t('tourGuideExplorer.viewPackage', '{name} Package').replace('{name}', destinationMeta.name)}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/packages"
                className="btn-ghost bg-white text-brand-600 hover:bg-slate-100 px-6 py-3.5 text-sm font-extrabold shadow-lg"
              >
                <span>{t('tourGuideExplorer.exploreAll', 'Explore All Packages')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/20 transition"
            >
              <PhoneCall className="h-4 w-4" />
              <span>{t('tourGuideExplorer.talkGuide', 'Talk to Tour Guide')}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
