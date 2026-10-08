import Link from 'next/link';
import { ExternalLink, Mail, Phone } from 'lucide-react';
import { siteConfig } from '@/config/site';

// Thin dark announcement bar that scrolls forever (duplicated list + CSS marquee).
export function TopTicker() {
  const items = [...siteConfig.announcements, ...siteConfig.announcements, ...siteConfig.announcements];
  return (
    <div className="flex h-9 items-center bg-slate-950 text-[12px] font-medium text-white">
      <div className="relative flex-1 overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap pr-10 hover:[animation-play-state:paused]" style={{ ['--marquee-duration' as string]: '45s' }}>
          {[0, 1].map((copy) =>
            items.map((a, i) => (
              <Link key={`${copy}-${i}`} href={a.href} className="flex items-center gap-2 opacity-90 transition hover:text-brand-300 hover:opacity-100" aria-hidden={copy === 1} tabIndex={copy === 1 ? -1 : undefined}>
                {'badge' in a && a.badge ? (
                  <span className="rounded bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-950">{a.badge}</span>
                ) : (
                  <span aria-hidden>{'icon' in a ? a.icon : ''}</span>
                )}
                {a.text}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </Link>
            )),
          )}
        </div>
      </div>
      <div className="hidden shrink-0 items-center gap-4 bg-slate-950 px-4 md:flex">
        <a href={siteConfig.contact.phoneHref} className="flex items-center gap-1.5 hover:text-brand-300">
          <Phone className="h-3.5 w-3.5" /> {siteConfig.contact.phone}
        </a>
        <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-1.5 hover:text-brand-300">
          <Mail className="h-3.5 w-3.5" /> {siteConfig.contact.email}
        </a>
      </div>
    </div>
  );
}
