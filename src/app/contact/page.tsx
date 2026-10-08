import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { ContactForm } from '@/components/ContactForm';
import { WhatsAppIcon } from '@/components/layout/WhatsAppButton';

export const metadata: Metadata = { title: 'Contact Us' };

export default function ContactPage() {
  const c = siteConfig.contact;
  const cards = [
    { Icon: Phone, title: 'Call us', text: c.phone, href: c.phoneHref },
    { Icon: WhatsAppIcon, title: 'WhatsApp', text: 'Chat with our team', href: `https://wa.me/${c.whatsapp}` },
    { Icon: Mail, title: 'Email', text: c.email, href: `mailto:${c.email}` },
    { Icon: Clock, title: 'Office hours', text: c.hours },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title="Let’s Plan Your" accent="Next Adventure" subtitle="Questions, custom trips or group bookings — we usually reply within a few hours." scene="beach" />
      <div className="container mt-14 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <Reveal className="space-y-4">
          {cards.map(({ Icon, title, text, href }) => {
            const body = (
              <>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{title}</span>
                  <span className="block text-sm text-ink-mute">{text}</span>
                </span>
              </>
            );
            return href ? (
              <a key={title} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-brand-200">{body}</a>
            ) : (
              <div key={title} className="card flex items-center gap-4 p-4">{body}</div>
            );
          })}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 p-4 text-sm font-semibold"><MapPin className="h-4 w-4 text-brand-500" /> {c.address}</div>
            <iframe title="Office location" src={`https://maps.google.com/maps?q=${encodeURIComponent(c.address)}&z=14&output=embed`} className="aspect-[16/10] w-full" loading="lazy" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </>
  );
}
