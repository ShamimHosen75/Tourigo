'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  Users,
  Calendar,
  Sparkles,
  Check,
  Copy,
  Bus,
  Car,
  Hotel,
  Utensils,
  Shield,
  ShoppingBag,
  TrendingDown,
  Info,
} from 'lucide-react';
import type { TourRouteGuide, CostCategory } from '@/types/tourGuide';
import { formatPrice } from '@/config/site';

function getCategoryIcon(name: string) {
  switch (name) {
    case 'Bus':
    case 'Train':
      return Bus;
    case 'Car':
      return Car;
    case 'Hotel':
      return Hotel;
    case 'Utensils':
      return Utensils;
    case 'Shield':
      return Shield;
    default:
      return ShoppingBag;
  }
}

export function TourGuideCostCalculator({ guide }: { guide: TourRouteGuide }) {
  const [tier, setTier] = useState<'budget' | 'standard' | 'luxury'>('standard');
  const [travelers, setTravelers] = useState<number>(4);
  const [days, setDays] = useState<number>(guide.recommendedDays || 3);
  const [copied, setCopied] = useState<boolean>(false);

  // Nights count
  const nights = Math.max(1, days - 1);

  // Compute calculated itemized costs
  const computedItems = guide.costCategories.map((cat) => {
    let baseUnitCost = 0;
    if (tier === 'budget') baseUnitCost = cat.budget;
    else if (tier === 'standard') baseUnitCost = cat.standard;
    else baseUnitCost = cat.luxury;

    let totalCategoryAmount = 0;
    let perPersonAmount = 0;

    if (cat.unit === 'per_group') {
      const maxGroup = cat.maxGroupSize || 8;
      const groupsNeeded = Math.ceil(travelers / maxGroup);
      totalCategoryAmount = baseUnitCost * groupsNeeded;
      perPersonAmount = Math.round(totalCategoryAmount / travelers);
    } else {
      // per person
      // Scale stay and food based on selected days and nights
      if (cat.id.includes('stay')) {
        // Base rate is per 1 night, scale by nights
        const stayMultiplier = nights;
        perPersonAmount = baseUnitCost * stayMultiplier;
      } else if (cat.id.includes('food')) {
        // Base rate scaled by days
        const foodMultiplier = days / (guide.recommendedDays || 3);
        perPersonAmount = Math.round(baseUnitCost * Math.max(1, foodMultiplier));
      } else {
        perPersonAmount = baseUnitCost;
      }
      totalCategoryAmount = perPersonAmount * travelers;
    }

    return {
      ...cat,
      perPersonAmount,
      totalCategoryAmount,
    };
  });

  const totalPerPerson = computedItems.reduce((acc, it) => acc + it.perPersonAmount, 0);
  const totalGroupAmount = totalPerPerson * travelers;

  const handleCopyBudget = () => {
    const text = `🧭 Tourigo A-to-Z Travel Budget Plan
Route: ${guide.routeTitle}
Travel Style: ${tier.toUpperCase()} | Group Size: ${travelers} traveler(s) | Duration: ${days}D/${nights}N
-----------------------------------------
Estimated Cost Per Person: ৳${totalPerPerson.toLocaleString('en-IN')}
Total Estimated Group Budget: ৳${totalGroupAmount.toLocaleString('en-IN')}
-----------------------------------------
Breakdown:
${computedItems.map((c) => `• ${c.name}: ৳${c.perPersonAmount.toLocaleString('en-IN')} / person`).join('\n')}
-----------------------------------------
Generated via Tourigo Route & Cost Planner`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="card overflow-hidden border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-ink sm:text-xl">A to Z Dynamic Cost Calculator</h3>
              <span className="chip bg-emerald-50 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Live Estimation
              </span>
            </div>
            <p className="text-xs text-ink-mute">
              Adjust group size, travel style and duration for real-time itemized cost breakdowns.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyBudget}
          className="btn-ghost py-2 px-4 text-xs font-bold text-slate-700"
          title="Copy formatted budget breakdown to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600">Budget Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Budget</span>
            </>
          )}
        </button>
      </div>

      {/* Control Filters: Style, Travelers, Duration */}
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {/* Travel Style Tier */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            1. Travel Style
          </label>
          <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {(['budget', 'standard', 'luxury'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`rounded-xl py-2 text-xs font-bold capitalize transition ${
                  tier === t
                    ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-ink-mute">
            {tier === 'budget' && 'Non-AC coach, shared jeeps & homestays'}
            {tier === 'standard' && 'AC coach, comfortable hotel & shared transfer'}
            {tier === 'luxury' && 'Private reserve vehicle, top view resort & feasts'}
          </p>
        </div>

        {/* Travelers Count */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              2. Travelers: <span className="text-brand-600 font-extrabold">{travelers} Person{travelers > 1 ? 's' : ''}</span>
            </label>
            {travelers >= 4 && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingDown className="h-3 w-3" /> Group savings active
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={15}
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-brand-500"
            />
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-ink">
              {travelers}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-ink-mute">
            Jeeps & boathouse rentals automatically split among group members.
          </p>
        </div>

        {/* Trip Duration */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            3. Duration
          </label>
          <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {[2, 3, 4].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-xl py-2 text-xs font-bold transition ${
                  days === d
                    ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-ink'
                }`}
              >
                {d}D / {d - 1}N
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-ink-mute">
            Standard recommended duration: {guide.recommendedDays} Days.
          </p>
        </div>
      </div>

      {/* Summary Highlight Box */}
      <div className="mt-7 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="chip bg-white/10 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
              Calculated Estimate ({tier.toUpperCase()} TIER)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white sm:text-4xl">
                {formatPrice(totalPerPerson)}
              </span>
              <span className="text-xs text-slate-300">/ person estimated</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Total group budget: <strong className="text-emerald-400 font-extrabold">{formatPrice(totalGroupAmount)}</strong> for {travelers} traveler{travelers > 1 ? 's' : ''} across {days} Days.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur sm:min-w-[200px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              Tourigo All-Inclusive Alternative
            </p>
            <p className="mt-0.5 text-xs text-slate-200">
              Zero stress. No counter haggling. Guaranteed military convoy slot & verified scenic resort.
            </p>
          </div>
        </div>
      </div>

      {/* Itemized Cost Breakdown Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80">
        <div className="bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink-soft">
          Itemized Cost Breakdown ({travelers} Person{travelers > 1 ? 's' : ''}, {days} Days)
        </div>
        <div className="divide-y divide-slate-100 bg-white">
          {computedItems.map((item) => {
            const Icon = getCategoryIcon(item.iconName);
            const percentage = Math.round((item.perPersonAmount / totalPerPerson) * 100);

            return (
              <div key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-ink">{item.name}</p>
                      {item.unit === 'per_group' && (
                        <span className="chip bg-blue-50 text-[10px] font-semibold text-blue-600">
                          Shared Group Cost
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-mute">{item.notes}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 sm:text-right">
                  <div className="hidden sm:block w-24">
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-[10px] text-ink-mute">{percentage}% of total</span>
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-ink">{formatPrice(item.perPersonAmount)}</p>
                    <p className="text-[11px] text-ink-mute">
                      Total: {formatPrice(item.totalCategoryAmount)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-ink-mute">
        <Info className="h-3.5 w-3.5 text-brand-500 shrink-0" />
        <span>
          Prices reflect verified average market rates across peak & standard travel seasons. Actual expenses may vary slightly depending on peak holiday surcharges.
        </span>
      </div>
    </div>
  );
}
