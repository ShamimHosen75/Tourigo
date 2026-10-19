'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
  Clock,
  Shield,
  Layers,
  Sparkles,
  Info,
  Bus,
  Train,
  Car,
  Ship,
  Footprints,
} from 'lucide-react';
import type { TourRouteGuide, RouteWaypoint, TransitVehicleMode } from '@/types/tourGuide';

function getVehicleIcon(mode?: TransitVehicleMode) {
  switch (mode) {
    case 'bus-ac':
    case 'bus-non-ac':
      return Bus;
    case 'train':
      return Train;
    case 'chander-gari':
      return Car;
    case 'ship':
    case 'boat':
      return Ship;
    case 'walk':
      return Footprints;
    case 'convoy':
      return Shield;
    default:
      return Compass;
  }
}

export function RouteMapVisualizer({ guide }: { guide: TourRouteGuide }) {
  const [selectedWp, setSelectedWp] = useState<RouteWaypoint>(guide.waypoints[0] || null);
  const [viewMode, setViewMode] = useState<'interactive' | 'google-map'>('interactive');

  const originWp = guide.waypoints[0];
  const destWp = guide.waypoints[guide.waypoints.length - 1];

  const googleDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${originWp?.lat ?? 23.8103},${originWp?.lng ?? 90.4125}&destination=${destWp?.lat ?? 23.3824},${destWp?.lng ?? 92.2938}&travelmode=driving`;
  const googleEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(guide.googleMapsQuery)}&z=9&output=embed`;

  return (
    <div className="card overflow-hidden border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 p-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-500 text-white shadow-md shadow-brand-500/25">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-ink sm:text-lg">Route & Waypoints Visualizer</h3>
              <span className="chip bg-brand-50 text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Interactive
              </span>
            </div>
            <p className="text-xs text-ink-mute">
              {guide.totalDistanceKm} km total corridor • {guide.totalDurationHours} travel time • {guide.waypoints.length} verified stops
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher Buttons */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'interactive'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-ink'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Route Flow</span>
            </button>
            <button
              onClick={() => setViewMode('google-map')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'google-map'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-ink'
              }`}
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Satellite / Live Map</span>
            </button>
          </div>

          <a
            href={googleDirUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost py-1.5 px-3.5 text-xs font-bold text-brand-600"
            title="Open in Google Maps for live driving / turn-by-turn GPS navigation"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Open in GPS</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="relative">
        {viewMode === 'interactive' ? (
          <div className="relative min-h-[420px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 p-6 text-white overflow-hidden">
            {/* Background Map Grid & Atmospheric Glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #00AEEF 1px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />

            {/* Quick Map Legend Overlay */}
            <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" /> Origin Point
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-amber-400 ring-4 ring-amber-400/20" /> Convoy / Ghat
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-brand-400 ring-4 ring-brand-400/20" /> Transit Hub
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-400 ring-4 ring-rose-400/20" /> Final Destination
                </span>
              </div>
              <span className="text-[11px] text-cyan-300/80 italic">Click any stop icon to inspect details</span>
            </div>

            {/* Visual Waypoint Nodes Corridor */}
            <div className="relative z-10 py-4">
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Horizontal / Vertical connecting animated route line */}
                <div className="hidden md:block absolute left-8 right-8 top-7 h-1 bg-gradient-to-r from-emerald-500 via-brand-500 to-rose-500 opacity-60 z-0">
                  <div className="h-full w-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.8)_50%,transparent_100%)] animate-pulse" />
                </div>

                {guide.waypoints.map((wp, idx) => {
                  const isSelected = selectedWp?.id === wp.id;
                  const isStart = idx === 0;
                  const isEnd = idx === guide.waypoints.length - 1;
                  const Icon = getVehicleIcon(wp.transitToNext?.mode);

                  return (
                    <div
                      key={wp.id}
                      className="relative z-10 flex flex-col items-center text-center cursor-pointer group w-full md:w-auto"
                      onClick={() => setSelectedWp(wp)}
                    >
                      {/* Node Circle */}
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative grid h-14 w-14 place-items-center rounded-2xl transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-br from-brand-400 to-cyan-500 text-white shadow-lg shadow-brand-500/50 ring-4 ring-white/30'
                            : isStart
                            ? 'bg-emerald-500/90 text-white ring-2 ring-emerald-400/40'
                            : isEnd
                            ? 'bg-rose-500/90 text-white ring-2 ring-rose-400/40'
                            : wp.type === 'convoy_checkpoint' || wp.type === 'ferry_ghat'
                            ? 'bg-amber-500/90 text-white ring-2 ring-amber-400/40'
                            : 'bg-slate-700/80 text-slate-200 hover:bg-slate-600'
                        }`}
                      >
                        {isStart ? (
                          <MapPin className="h-6 w-6" />
                        ) : isEnd ? (
                          <Sparkles className="h-6 w-6" />
                        ) : wp.type === 'convoy_checkpoint' ? (
                          <Shield className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}

                        {/* Step number badge */}
                        <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-slate-950 text-[10px] font-extrabold text-cyan-300 ring-1 ring-white/20">
                          {idx + 1}
                        </span>
                      </motion.div>

                      {/* Stop Title & Badge */}
                      <div className="mt-2.5 max-w-[130px]">
                        <p className={`text-xs font-bold transition line-clamp-1 ${isSelected ? 'text-cyan-300' : 'text-slate-200 group-hover:text-white'}`}>
                          {wp.name.split('(')[0]}
                        </p>
                        {wp.badge && (
                          <span className="mt-0.5 inline-block text-[10px] font-semibold text-amber-300/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {wp.badge}
                          </span>
                        )}
                      </div>

                      {/* Small arrow to next stop */}
                      {!isEnd && (
                        <div className="md:hidden my-2 text-cyan-400/50 flex flex-col items-center">
                          <span className="text-[10px]">{wp.transitToNext?.duration}</span>
                          <span className="text-lg">↓</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Waypoint Detail Card Overlay */}
            <AnimatePresence mode="wait">
              {selectedWp && (
                <motion.div
                  key={selectedWp.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative z-10 mt-6 rounded-2xl border border-white/10 bg-slate-900/85 p-5 backdrop-blur-xl shadow-2xl"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="chip bg-brand-500/20 text-cyan-300 border border-brand-400/30 text-[10px] font-bold uppercase tracking-wider">
                          Stop Details
                        </span>
                        {selectedWp.stayTime && (
                          <span className="chip bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-semibold">
                            <Clock className="h-3 w-3" /> Stop duration: {selectedWp.stayTime}
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 text-lg font-black text-white">{selectedWp.name}</h4>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-2xl">
                        {selectedWp.description}
                      </p>
                    </div>

                    {selectedWp.transitToNext && (
                      <div className="rounded-xl border border-cyan-500/25 bg-cyan-950/40 p-3.5 text-right sm:min-w-[240px]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Next Transit Leg</p>
                        <p className="mt-0.5 text-sm font-bold text-white">{selectedWp.transitToNext.vehicleName}</p>
                        <div className="mt-1.5 flex items-center justify-end gap-3 text-xs text-slate-300">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-cyan-400" /> {selectedWp.transitToNext.duration}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-400">{selectedWp.transitToNext.fareRange}</span>
                        </div>
                        {selectedWp.transitToNext.advice && (
                          <p className="mt-2 text-[11px] text-amber-300/90 italic bg-amber-500/10 p-1.5 rounded border border-amber-500/20 text-left">
                            💡 {selectedWp.transitToNext.advice}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Google Maps Embed */
          <div className="relative aspect-[16/9] w-full bg-slate-100 sm:aspect-[21/9]">
            <iframe
              title={`Map of route from ${guide.routeTitle}`}
              src={googleEmbedUrl}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              {guide.googleMapsQuery}
            </div>
          </div>
        )}
      </div>

      {/* Corridor Elevation & Terrain Profile Footer */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 bg-white p-4 text-xs sm:grid-cols-4 sm:px-6">
        <div>
          <span className="text-ink-mute">Corridor Distance</span>
          <p className="mt-0.5 text-sm font-extrabold text-ink">{guide.totalDistanceKm} Kilometers</p>
        </div>
        <div>
          <span className="text-ink-mute">Transit Duration</span>
          <p className="mt-0.5 text-sm font-extrabold text-brand-600">{guide.totalDurationHours}</p>
        </div>
        <div>
          <span className="text-ink-mute">Recommended Stay</span>
          <p className="mt-0.5 text-sm font-extrabold text-ink">
            {guide.recommendedDays} Days / {guide.recommendedDays - 1} Nights
          </p>
        </div>
        <div>
          <span className="text-ink-mute">Terrain Profile</span>
          <p className="mt-0.5 text-sm font-extrabold text-emerald-600 flex items-center gap-1">
            <span>Highway</span> → <span>Hill / Ocean</span>
          </p>
        </div>
      </div>
    </div>
  );
}
