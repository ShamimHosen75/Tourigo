import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass, HeartHandshake, Leaf, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { StatRow } from '@/components/ui/CountUp';
import { sceneDataUri } from '@/lib/scene';

export const metadata: Metadata = { title: 'About Us' };

const values = [
  { Icon: ShieldCheck, title: 'Safety first', text: 'Trained leaders, first-aid kits, registered local guides and strict group ratios on every trip.' },
  { Icon: Compass, title: 'Local experts', text: 'We have walked every trail we sell — from Keokradong to the canals of the Sundarbans.' },
  { Icon: HeartHandshake, title: 'Community', text: 'We stay with and buy from local families, guides and boatmen wherever we go.' },
  { Icon: Leaf, title: 'Leave no trace', text: 'Plastic-free trips, small groups and respect for the hills, forests and coral.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About Us" title="We Live For" accent="The Journey" subtitle={`${siteConfig.name} helps travellers discover the hidden beauty of ${siteConfig.country}, one trail at a time.`} scene="lake" />
      <section className="container mt-16 grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <h2 className="section-title">
            Our Story <span className="accent">Started on a Trail</span>
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-soft">
            <p>{siteConfig.name} began as a group of friends who spent every holiday exploring the hills of Bandarban and the haors of Sylhet. Friends of friends started asking to join, and soon we were planning trips every weekend.</p>
            <p>Today we run treks, tours, family holidays, campus trips and corporate retreats across Bangladesh — with the same spirit: small groups, honest prices in BDT, and memories that last.</p>
          </div>
          <div className="mt-6">
            <StatRow stats={[{ value: 10000, suffix: '+', label: 'Happy Travelers' }, { value: 500, suffix: '+', label: 'Trips Completed' }, { value: 36, suffix: '+', label: 'Destinations' }]} />
          </div>
          <Link href="/packages" className="btn-primary mt-8">Explore Packages</Link>
        </Reveal>
        <Reveal delay={0.15} className="grid grid-cols-2 gap-4">
          {(['hills', 'island', 'tea', 'waterfall'] as const).map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s} src={sceneDataUri(s, `about-${s}`)} alt="" className={`aspect-[4/5] w-full rounded-2xl object-cover shadow-card ${i % 2 ? 'mt-8' : ''}`} />
          ))}
        </Reveal>
      </section>
      <section className="container mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(({ Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 0.08} className="card p-6 transition hover:-translate-y-1 hover:shadow-card">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-500">
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-bold">{title}</h3>
            <p className="mt-2 text-sm text-ink-mute">{text}</p>
          </Reveal>
        ))}
      </section>
    </>
  );
}
