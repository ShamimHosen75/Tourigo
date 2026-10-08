'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ExternalLink, Loader2, MapPin, Send, User, X } from 'lucide-react';
import { formatPrice, siteConfig } from '@/config/site';
import { formatRange } from '@/lib/dates';
import type { Batch, Package } from '@/lib/types';
import { submitBooking, type ActionResult } from '@/app/actions';
import { WhatsAppIcon } from '@/components/layout/WhatsAppButton';

export function BookingModal({ pkg, batch, travelers, onClose }: { pkg: Package; batch: Batch; travelers: number; onClose: () => void }) {
  const [pickupId, setPickupId] = useState(pkg.pickupPoints[0]?.id ?? '');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', notes: '' });
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const pickup = pkg.pickupPoints.find((p) => p.id === pickupId);
  const base = batch.price * travelers;
  const pickupFee = (pickup?.extraFee ?? 0) * travelers;
  const total = Math.max(0, base + pickupFee);
  const batchLabel = formatRange(batch.startDate, batch.endDate);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await submitBooking({
        packageSlug: pkg.slug,
        packageTitle: pkg.title,
        batchId: batch.id,
        batchLabel,
        travelers,
        pickupPointId: pickupId,
        pickupPointName: pickup?.name ?? '',
        totalAmount: total,
        ...form,
      });
      setResult(res);
    });
  };

  const done = result?.ok ? result : null;
  const waText = done ? encodeURIComponent(`Hi! I just submitted booking ${done.reference} for ${pkg.title} (${batchLabel}, ${travelers} travellers).`) : '';

  return (
    <motion.div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div role="dialog" aria-modal="true" aria-labelledby="booking-title" initial={{ y: 40, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 30, scale: 0.97, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className="relative w-full max-w-3xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-ink-mute hover:text-ink">
          <X className="h-4 w-4" />
        </button>

        {done ? (
          <div className="py-8 text-center">
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-11 w-11 text-emerald-500" />
            </motion.div>
            <h2 className="mt-5 text-2xl font-bold">Booking request received!</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-mute">
              Thank you, {form.fullName.split(' ')[0]}. Your seats for <b>{pkg.title}</b> ({batchLabel}) are on hold. Our team will call you at <b>{form.phone}</b> within 24 hours to confirm and share payment details.
            </p>
            <p className="mt-4 inline-block rounded-xl bg-slate-50 px-4 py-2 font-mono text-sm">
              Reference: <b>{done.reference}</b>
            </p>
            {done.demo && <p className="mt-2 text-xs text-amber-600">Demo mode — connect Supabase to store bookings.</p>}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="btn-primary bg-[#25d366] shadow-emerald-500/25 hover:bg-[#1ebe5a]">
                <WhatsAppIcon className="h-4 w-4" /> Message us on WhatsApp
              </a>
              <button onClick={onClose} className="btn-ghost">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex flex-wrap items-center gap-2 pr-10">
              <span className="chip bg-brand-50 text-[10px] uppercase tracking-wider text-brand-600">Express Checkout</span>
              <span className="text-xs text-ink-mute">
                Batch: {batchLabel} • {travelers} Traveller{travelers > 1 ? 's' : ''}
              </span>
            </div>
            <h2 id="booking-title" className="mt-2 text-2xl font-bold">
              {pkg.title}
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                  <MapPin className="h-3.5 w-3.5 text-brand-500" /> Select Starting Pickup Location
                </p>
                <div className="mt-3 max-h-60 space-y-2 overflow-y-auto pr-1">
                  {pkg.pickupPoints.map((p) => {
                    const sel = p.id === pickupId;
                    return (
                      <label key={p.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${sel ? 'border-brand-400 bg-brand-50/60 ring-4 ring-brand-100' : 'border-slate-200 hover:border-brand-200'}`}>
                        <input type="radio" name="pickup" className="mt-1 accent-brand-500" checked={sel} onChange={() => setPickupId(p.id)} />
                        <span className="flex-1">
                          <span className="flex items-center justify-between gap-2 text-sm font-semibold text-ink">
                            {p.name}
                            <span className={`text-[11px] ${p.extraFee > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{p.extraFee > 0 ? `+${formatPrice(p.extraFee)}` : p.extraFee < 0 ? `−${formatPrice(-p.extraFee)}` : 'Free'}</span>
                          </span>
                          <span className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-ink-mute">
                            {p.detail} • {p.time}
                            {p.mapUrl && (
                              <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-0.5 text-brand-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                Google Maps <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="flex justify-between text-ink-soft">
                    <span>
                      Package Rate ({travelers} × {formatPrice(batch.price)})
                    </span>
                    <span>{formatPrice(base)}</span>
                  </div>
                  {pickupFee !== 0 && (
                    <div className="flex justify-between text-ink-soft">
                      <span>Pickup adjustment</span>
                      <span>
                        {pickupFee > 0 ? '+' : '−'}
                        {formatPrice(Math.abs(pickupFee))}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                    <span>Total Payable Amount</span>
                    <span className="text-lg text-brand-500">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                  <User className="h-3.5 w-3.5 text-brand-500" /> Primary Traveller Contact Details
                </p>
                <div className="mt-3 space-y-3">
                  <Field label="Full Name (Required)">
                    <input required className="input" placeholder="e.g. Rahim Uddin" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoComplete="name" />
                  </Field>
                  <Field label="Email Address (Required)">
                    <input required type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                  </Field>
                  <Field label="Phone Number (Required)">
                    <input required type="tel" className="input" placeholder="+880 17XX-XXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
                  </Field>
                  <Field label="Notes (optional)">
                    <textarea rows={2} className="input resize-none" placeholder="Dietary needs, gear rental, questions…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </Field>
                </div>
                {result && !result.ok && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{result.error}</p>}
                <button type="submit" disabled={pending} className="btn-primary mt-4 w-full py-3.5">
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Confirm &amp; Submit Booking Inquiry
                </button>
                <p className="mt-2 text-center text-[11px] text-ink-mute">No online payment required. Pay after our team confirms your seats.</p>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
