import { MessageSquare, Quote, Star } from 'lucide-react';
import type { Testimonial } from '@/lib/types';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Reveal } from '@/components/ui/Reveal';

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="w-[290px] shrink-0 rounded-2xl border border-brand-100/70 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(0,174,240,.45)] transition hover:-translate-y-1 hover:border-brand-300 sm:w-[320px]">
      <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
        ))}
      </div>
      <blockquote className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">“{t.quote}”</blockquote>
      <figcaption className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-sm font-bold text-brand-700">{t.name}</p>
          <p className="text-xs text-ink-mute">{t.trip}</p>
        </div>
        <Quote className="h-5 w-5 fill-brand-400 text-brand-400" />
      </figcaption>
    </figure>
  );
}

function Row({ items, reverse, duration }: { items: Testimonial[]; reverse?: boolean; duration: string }) {
  const doubled = [...items, ...items];
  return (
    <div className="fade-x pause-on-hover overflow-hidden py-3">
      <div className={`flex w-max gap-5 ${reverse ? 'animate-marquee-rev' : 'animate-marquee'}`} style={{ ['--marquee-duration' as string]: duration }}>
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
    <section className="py-20">
      <div className="container">
        <Reveal>
          <SectionBadge icon={<MessageSquare className="h-3.5 w-3.5" />}>Testimonials</SectionBadge>
          <h2 className="section-title mt-4">
            What Adventurers Say <span className="accent">About Their Journey</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm text-ink-mute">Real stories from travellers who explored Bangladesh with us.</p>
        </Reveal>
      </div>
      <div className="mt-8 space-y-2">
        <Row items={items.slice(0, half)} duration="55s" />
        <Row items={items.slice(half)} reverse duration="60s" />
      </div>
    </section>
  );
}
