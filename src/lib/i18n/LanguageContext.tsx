'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Locale, LanguageOption } from './types';
import { SUPPORTED_LOCALES } from './types';
import { translations, localizedFaqs, type TranslatedFaq } from './translations';
import type { Faq } from '@/lib/types';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  options: LanguageOption[];
  currentOption: LanguageOption;
  t: (path: string, fallback?: string, params?: Record<string, string | number>) => string;
  formatNumber: (num: number | string) => string;
  formatPrice: (amount: number) => string;
  getLocalizedFaqs: (defaultFaqs: Faq[]) => Faq[];
}

const STORAGE_KEY = 'tourigo_lang';

const LanguageContext = createContext<LanguageContextType | null>(null);

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const HI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

function convertDigits(input: string | number, locale: Locale): string {
  const str = String(input);
  if (locale === 'bn') {
    return str.replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
  }
  if (locale === 'hi') {
    return str.replace(/\d/g, (d) => HI_DIGITS[Number(d)]);
  }
  return str;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && (saved === 'en' || saved === 'bn' || saved === 'hi')) {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // storage unavailable / SSR
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // ignore
    }
  }, []);

  const currentOption = useMemo(
    () => SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0],
    [locale]
  );

  const t = useCallback(
    (path: string, fallback?: string, params?: Record<string, string | number>): string => {
      const parts = path.split('.');
      let current: any = translations[locale];

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          current = undefined;
          break;
        }
      }

      // fallback to English if not found in current locale
      if (current === undefined && locale !== 'en') {
        let enCurrent: any = translations.en;
        for (const part of parts) {
          if (enCurrent && typeof enCurrent === 'object' && part in enCurrent) {
            enCurrent = enCurrent[part];
          } else {
            enCurrent = undefined;
            break;
          }
        }
        current = enCurrent;
      }

      let result = typeof current === 'string' ? current : fallback ?? path;

      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          const localizedVal = convertDigits(val, locale);
          result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), localizedVal);
        });
      }

      return result;
    },
    [locale]
  );

  const formatNumber = useCallback(
    (num: number | string): string => {
      return convertDigits(num, locale);
    },
    [locale]
  );

  const formatPrice = useCallback(
    (amount: number): string => {
      const standardStr = amount.toLocaleString('en-IN');
      const converted = convertDigits(standardStr, locale);
      return `৳${converted}`;
    },
    [locale]
  );

  const getLocalizedFaqs = useCallback(
    (defaultFaqs: Faq[]): Faq[] => {
      if (locale === 'en') {
        return defaultFaqs;
      }
      const locList = localizedFaqs[locale] || [];
      const map = new Map<string, TranslatedFaq>();
      locList.forEach((item) => map.set(item.id, item));

      return defaultFaqs.map((orig) => {
        const tr = map.get(orig.id);
        if (tr) {
          return {
            ...orig,
            question: tr.question,
            answer: tr.answer,
            category: tr.category,
          };
        }
        return orig;
      });
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      options: SUPPORTED_LOCALES,
      currentOption,
      t,
      formatNumber,
      formatPrice,
      getLocalizedFaqs,
    }),
    [locale, setLocale, currentOption, t, formatNumber, formatPrice, getLocalizedFaqs]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
