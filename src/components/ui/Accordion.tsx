'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function AccordionItem({ open, onToggle, title, badge, children }: { open: boolean; onToggle: () => void; title: React.ReactNode; badge?: string; children: React.ReactNode }) {
  return (
    <div className={`overflow-hidden rounded-2xl border transition-all duration-300 ${open ? 'border-brand-300/80 bg-white shadow-[0_12px_35px_-18px_rgba(0,174,240,0.25)] ring-1 ring-brand-400/20' : 'border-slate-200/80 bg-white/90 hover:border-slate-300 hover:shadow-sm'}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors">
        {badge && <span className="rounded-full bg-brand-50 border border-brand-100/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">{badge}</span>}
        <span className={`flex-1 text-sm font-bold sm:text-[15px] transition-colors ${open ? 'text-brand-600' : 'text-slate-900'}`}>{title}</span>
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-all duration-300 ${open ? 'bg-brand-500 text-white rotate-180 shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="border-t border-slate-100/80 px-5 pb-5 pt-3.5 text-sm leading-relaxed text-slate-600">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
