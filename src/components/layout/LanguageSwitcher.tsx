'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Locale } from '@/lib/i18n/types';

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({ compact = false, className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale, options, currentOption } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Select language. Current: ${currentOption.label}`}
        className={`group flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/95 text-slate-700 shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
          compact ? 'px-2.5 py-1.5 text-xs font-semibold' : 'px-3 py-2 text-xs font-bold'
        }`}
      >
        <span className="text-sm leading-none" aria-hidden="true">
          {currentOption.flag}
        </span>
        <span className="font-semibold text-slate-800 group-hover:text-brand-600">
          {compact ? currentOption.shortLabel : currentOption.nativeName}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:text-brand-500 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            role="listbox"
            aria-label="Language options"
            className="absolute right-0 z-50 mt-2 min-w-[170px] origin-top-right rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-md focus:outline-none"
          >
            <div className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 border-b border-slate-100 mb-1 flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-brand-500" />
              <span>Choose Language</span>
            </div>

            <div className="space-y-0.5">
              {options.map((opt) => {
                const isSelected = opt.code === locale;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.code)}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-brand-50/90 font-bold text-brand-600 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none" aria-hidden="true">
                        {opt.flag}
                      </span>
                      <div>
                        <div className="font-semibold">{opt.nativeName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{opt.label}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-brand-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
