'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function AccordionItem({ open, onToggle, title, badge, children }: { open: boolean; onToggle: () => void; title: React.ReactNode; badge?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border bg-white transition ${open ? 'border-brand-200 shadow-[0_12px_30px_-20px_rgba(0,174,240,.6)]' : 'border-slate-100 hover:border-slate-200'}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-5 py-4 text-left">
        {badge && <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600">{badge}</span>}
        <span className={`flex-1 text-sm font-semibold sm:text-[15px] ${open ? 'text-brand-600' : 'text-ink'}`}>{title}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-mute transition-transform duration-300 ${open ? 'rotate-180 text-brand-500' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="border-t border-slate-100 px-5 pb-5 pt-3 text-sm leading-relaxed text-ink-mute">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
