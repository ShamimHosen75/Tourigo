import Link from 'next/link';
import { ChevronRight, Mail, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '@/components/ui/SocialIcons';
import { Logo } from './Logo';
import { HeroTrekker } from '@/components/home/HeroTrekker';

// Trekker height in px that appears above the footer border line.
const TREKKER_H = 130;
// The HeroTrekker SVG viewBox is 230×480; scale to fill TREKKER_H pixels.
const TREKKER_SCALE = TREKKER_H / 480;
const TREKKER_W = Math.round(230 * TREKKER_SCALE);

function WalkingHiker() {
  // Large detailed trekker (same as hero) that walks along the footer's top line.
  return (
    <div
      className="pointer-events-none absolute inset-x-0 overflow-hidden"
      style={{ top: -TREKKER_H, height: TREKKER_H }}
      aria-hidden
    >
      <div className="absolute bottom-0 animate-walk">
        <svg
          viewBox={`0 0 ${TREKKER_W} ${TREKKER_H}`}
          width={TREKKER_W}
          height={TREKKER_H}
          className="animate-bob"
          overflow="visible"
        >
          <HeroTrekker x={TREKKER_W / 2} y={TREKKER_H} scale={TREKKER_SCALE} />
        </svg>
      </div>
    </div>
  );
}

export function Footer({ featured }: { featured: { title: string; slug: string }[] }) {
  const quick = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Packages', href: '/packages' },
    { label: 'Blogs & Articles', href: '/blogs' },
    { label: 'Contact Us', href: '/contact' },
  ];
  return (
    <footer className="relative mt-24 border-t-2 border-brand-400 bg-gradient-to-b from-white to-amber-50/40">
      <WalkingHiker />
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.4fr]">
        <div>
          <Logo size="lg" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-mute">
            Your ultimate companion for thrilling treks, guided holiday tours, camping getaways and unforgettable travel experiences across {siteConfig.country}.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { href: siteConfig.social.instagram, Icon: InstagramIcon, label: 'Instagram' },
              { href: siteConfig.social.facebook, Icon: FacebookIcon, label: 'Facebook' },
              { href: siteConfig.social.youtube, Icon: YoutubeIcon, label: 'YouTube' },
            ].map(({ href, Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-ink-mute transition hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-500">
                <Icon />
              </a>
            ))}
          </div>
        </div>
        <FooterCol title="Quick Links">
          {quick.map((l) => (
            <FooterLink key={l.href} href={l.href}>{l.label}</FooterLink>
          ))}
        </FooterCol>
        <FooterCol title="Featured Treks & Tours">
          {featured.map((p) => (
            <FooterLink key={p.slug} href={`/packages/${p.slug}`}>{p.title}</FooterLink>
          ))}
        </FooterCol>
        <FooterCol title="Contact Support">
          <li className="flex gap-2.5 text-sm text-ink-mute"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />{siteConfig.contact.address}</li>
          <li><a href={siteConfig.contact.phoneHref} className="flex gap-2.5 text-sm text-ink-mute hover:text-brand-500"><Phone className="h-4 w-4 text-brand-500" />{siteConfig.contact.phone}</a></li>
          <li><a href={`mailto:${siteConfig.contact.email}`} className="flex gap-2.5 text-sm text-ink-mute hover:text-brand-500"><Mail className="h-4 w-4 text-brand-500" />{siteConfig.contact.email}</a></li>
        </FooterCol>
      </div>
      <div className="border-t border-slate-200/70">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-mute md:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-5">
            {siteConfig.legal.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-brand-500">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-ink">{title}</h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="group flex items-center gap-1.5 text-sm text-ink-mute transition hover:text-brand-500">
        <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        {children}
      </Link>
    </li>
  );
}
