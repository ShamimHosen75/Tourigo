'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Breadcrumb({ items, backHref }: { items: { label: string; href?: string }[]; backHref: string }) {
  const { t } = useLanguage();

  const getLocalizedLabel = (label: string) => {
    if (label.toLowerCase() === 'home') return t('nav.home', 'Home');
    if (label.includes('Tour Guide') || label.includes('Route Map')) {
      return t('tourGuideExplorer.breadcrumb', 'A to Z Tour Guide & Route Map');
    }
    return label;
  };

  return (
    <div className="sticky top-[var(--header-h)] z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="container flex h-12 items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-xs">
          {items.map((it, i) => (
            <span key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
              {it.href ? (
                <Link href={it.href} className="text-ink-mute hover:text-brand-500">
                  {getLocalizedLabel(it.label)}
                </Link>
              ) : (
                <span className="truncate font-semibold text-ink">{getLocalizedLabel(it.label)}</span>
              )}
            </span>
          ))}
        </nav>
        <Link href={backHref} className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-ink-soft hover:border-brand-300 hover:text-brand-600">
          <ArrowLeft className="h-3.5 w-3.5" /> {t('common.back', 'Back')}
        </Link>
      </div>
    </div>
  );
}
