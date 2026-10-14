import { CheckCircle2, MessageSquare, Quote, Star } from 'lucide-react';
import type { Testimonial } from '@/lib/types';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Reveal } from '@/components/ui/Reveal';

function Card({ t }: { t: Testimonial }) {
  const initials = t.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <figure className="w-[310px] shrink-0 rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_12px_35px_-15px_rgba(0,174,240,0.12)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-[0_20px_45px_-15px_rgba(0,174,240,0.22)] sm:w-[350px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5" aria-label={`${t.rating} out of 5 stars`}>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-700">{t.rating}.0</span>
        </div>
        <Quote className="h-5 w-5 text-brand-400/50" />
      </div>

      <blockquote className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-700">“{t.quote}”</blockquote>

      <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-cyan-400 text-xs font-black uppercase text-white shadow-md shadow-brand-500/20">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-slate-900">{t.name}</p>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
              <CheckCircle2 className="h-2.5 w-2.5" /> Verified
            </span>
          </div>
          <p className="truncate text-xs text-slate-500">{t.trip}</p>
        </div>
      </figcaption>
    </figure>
  );
}

function Row({ items, reverse, duration }: { items: Testimonial[]; reverse?: boolean; duration: string }) {
  const doubled = [...items, ...items];
  return (
    <div className="fade-x pause-on-hover overflow-hidden py-3">
      <div className={`flex w-max gap-6 ${reverse ? 'animate-marquee-rev' : 'animate-marquee'}`} style={{ ['--marquee-duration' as string]: duration }}>
        {doubled.map((t, i) => (
          <Card key={`${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  const half = Math.ceil(items.length / 2);
  return (
    <section className="relative overflow-hidden py-24 sm:py-28 bg-gradient-to-b from-paper/50 via-white to-paper/50">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-100/30 blur-3xl" />

      <div className="container relative text-center">
        <Reveal>
          <SectionBadge icon={<MessageSquare className="h-3.5 w-3.5" />}>Traveler Reviews</SectionBadge>
          <h2 className="section-title mt-4">
            What Adventurers Say <span className="accent">About Their Journey</span>
          </h2>
          <p className="mx-auto mt-3.5 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600">
            Real feedback from travellers and adventure seekers who explored the hills, rivers and beaches of Bangladesh with us.
          </p>
        </Reveal>
      </div>
      <div className="mt-12 space-y-4">
        <Row items={items.slice(0, half)} duration="55s" />
        <Row items={items.slice(half)} reverse duration="60s" />
      </div>
    </section>
  );
}
