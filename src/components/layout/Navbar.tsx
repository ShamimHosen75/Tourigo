'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Phone, X } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { Logo } from './Logo';

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav className={`border-b bg-white/95 backdrop-blur transition-shadow ${scrolled ? 'border-slate-200 shadow-[0_6px_20px_-12px_rgba(15,23,42,.25)]' : 'border-transparent'}`}>
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <Logo />
        <ul className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={`relative px-4 py-2 text-[15px] font-medium transition ${isActive(item.href) ? 'text-brand-500' : 'text-ink-soft hover:text-brand-500'}`}>
                {item.label}
                {isActive(item.href) && <motion.span layoutId="nav-underline" className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />}
              </Link>
            </li>
          ))}
        </ul>
        <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-100 bg-white md:hidden">
            <ul className="space-y-1 p-4">
              {siteConfig.nav.map((item, i) => (
                <motion.li key={item.href} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <Link href={item.href} className={`block rounded-xl px-4 py-3 font-medium ${isActive(item.href) ? 'bg-brand-50 text-brand-600' : 'text-ink-soft'}`}>
                    {item.label}
                  </Link>
                </motion.li>
              ))}
              <li>
                <a href={siteConfig.contact.phoneHref} className="btn-primary mt-2 w-full">
                  <Phone className="h-4 w-4" /> Call {siteConfig.contact.phone}
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
