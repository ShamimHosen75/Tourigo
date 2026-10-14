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
    <section className="relative overflow-hidden py-24 sm:py-28 bg-slate-50/50">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-brand-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-cyan-100/40 blur-3xl" />
      <div className="container relative max-w-3xl">
        <Reveal className="text-center">
          <SectionBadge icon={<HelpCircle className="h-3.5 w-3.5" />}>Help &amp; Answers</SectionBadge>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-[2.75rem]">
            Got Questions? <span className="accent">We’ve Got Answers</span>
          </h2>
          <p className="mx-auto mt-3.5 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600">
            Find everything you need to know about trip difficulty, gear essentials, payment options, and travel guidelines in Bangladesh.
          </p>
        </Reveal>

        <div className="relative mx-auto mt-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions or keywords (e.g. beginner, booking, refund)..."
            className="input rounded-2xl border-slate-200/90 bg-white/95 pl-11 shadow-sm transition-all focus:border-brand-400 focus:shadow-md"
            aria-label="Search FAQs"
          />
        </div>

        <div className="no-scrollbar mt-6 flex justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
          {(['All', ...CATS] as const).map((c) => {
            const count = c === 'All' ? faqs.length : faqs.filter((f) => f.category === c).length;
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? 'border border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'border border-slate-200/80 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {c !== 'All' && <Tag className="h-3 w-3" />}
                <span>{c === 'All' ? 'All Questions' : c}</span>
                <span className={`text-[10px] ${active ? 'text-white/80' : 'text-slate-400'}`}>({count})</span>
              </button>
            );
          })}
        </div>

        <motion.div layout className="mt-8 space-y-3.5">
          <AnimatePresence mode="popLayout">
            {filtered.map((f) => (
              <motion.div key={f.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}>
                <AccordionItem open={open === f.id} onToggle={() => setOpen(open === f.id ? null : f.id)} title={f.question} badge={f.category}>
                  {f.answer}
                </AccordionItem>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && <p className="py-12 text-center text-sm font-medium text-slate-500">No questions match “{query}”. Try another keyword.</p>}
        </motion.div>

        <Reveal className="glass-panel mx-auto mt-14 max-w-xl p-8 text-center sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-brand-500 to-cyan-400 text-white shadow-lg shadow-brand-500/25">
            <MessageCircle className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-2xl font-extrabold text-slate-900">Still Have Questions?</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
            Our local travel experts are ready to assist you with customized routes, group bookings or gear prep.
          </p>
          <Link href="/contact" className="btn-primary mt-6 px-7 py-3.5">
            <span>Talk to Our Travel Team</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
