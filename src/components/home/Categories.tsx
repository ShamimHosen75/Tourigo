import Link from 'next/link';
import { ArrowRight, Package as PackageIcon } from 'lucide-react';
import type { Category } from '@/lib/types';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { Reveal } from '@/components/ui/Reveal';
import { SmartImage } from '@/components/ui/SmartImage';

export function Categories({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  return (
    <section id="categories" className="scroll-mt-28 py-20">
      <div className="container">
        <Reveal>
          <SectionBadge>Explore Categories</SectionBadge>
          <h2 className="section-title mt-4">
            Find Your Perfect <span className="accent">Adventure Style</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm text-ink-mute">Discover curated travel experiences tailored for families, couples, adventurers and explorers.</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 4) * 0.08}>
              <Link href={`/packages?category=${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-slate-200 shadow-card transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl sm:aspect-[1/1.1]">
                <SmartImage src={c.image} scene={c.scene} seed={c.slug} alt={c.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                {/* poster lettering */}
                <div className="absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white via-white/85 to-transparent" />
                <p className="absolute inset-x-2 top-2 text-center font-display text-[clamp(1.2rem,3.4vw,2.4rem)] font-extrabold uppercase leading-[0.9] tracking-tight text-slate-900 [text-wrap:balance] transition duration-500 group-hover:tracking-normal">
                  {c.displayTitle}
                </p>
                <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-4">
                  <span className="chip bg-white/20 text-[10px] text-white backdrop-blur">
                    <PackageIcon className="h-3 w-3" /> {counts[c.slug] ?? 0} {(counts[c.slug] ?? 0) === 1 ? 'Package' : 'Packages'}
                  </span>
                  <h3 className="mt-2 text-base font-bold sm:text-lg">{c.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] text-white/75 sm:text-xs">{c.description}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold">
                    Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
