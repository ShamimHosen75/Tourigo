'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, MessageCircle, Search, Tag } from 'lucide-react';
import type { Faq } from '@/lib/types';
import { AccordionItem } from '@/components/ui/Accordion';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Reveal } from '@/components/ui/Reveal';

const CATS: Faq['category'][] = ['General', 'Booking', 'Safety', 'Gear', 'Cancellation'];

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<Faq['category'] | 'All'>('All');
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => (cat === 'All' || f.category === cat) && (!q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)));
  }, [faqs, query, cat]);

  return (
    <section className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-amber-100/60 blur-3xl" />
      <div className="container relative max-w-3xl">
        <Reveal className="text-center">
          <SectionBadge icon={<HelpCircle className="h-3.5 w-3.5" />}>Frequently Asked Questions</SectionBadge>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-[2.6rem]">Got Questions? We’ve Got Answers</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-ink-mute">Find answers to common questions about our trips, itineraries, booking process, safety guidelines and gear recommendations.</p>
        </Reveal>

        <div className="relative mx-auto mt-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions or keywords (e.g. beginner, booking, refund)..." className="input rounded-full bg-white pl-11 shadow-sm" aria-label="Search FAQs" />
        </div>

        <div className="no-scrollbar mt-5 flex justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
          {(['All', ...CATS] as const).map((c) => {
            const count = c === 'All' ? faqs.length : faqs.filter((f) => f.category === c).length;
            const active = cat === c;
            return (
              <button key={c} onClick={() => setCat(c)} className={`chip shrink-0 border transition ${active ? 'border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/30' : 'border-slate-200 bg-white text-ink-soft hover:border-brand-300'}`}>
                {c !== 'All' && <Tag className="h-3 w-3" />}
                {c === 'All' ? 'All Questions' : c} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        <motion.div layout className="mt-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((f) => (
              <motion.div key={f.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}>
                <AccordionItem open={open === f.id} onToggle={() => setOpen(open === f.id ? null : f.id)} title={f.question} badge={f.category}>
                  {f.answer}
                </AccordionItem>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-ink-mute">No questions match “{query}”. Try another keyword.</p>}
        </motion.div>

        <Reveal className="card mx-auto mt-12 max-w-xl p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-500">
            <MessageCircle className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-xl font-bold">Still Have Questions?</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-mute">Our travel experts are available to help you with custom itineraries, group discounts or booking details.</p>
          <Link href="/contact" className="btn-primary mt-5">
            Contact Our Team
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
