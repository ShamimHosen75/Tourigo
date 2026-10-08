import { sceneDataUri } from '@/lib/scene';
import type { SceneKind } from '@/lib/types';
import { Reveal } from './Reveal';

export function PageHero({ eyebrow, title, accent, subtitle, scene = 'hills' }: { eyebrow: string; title: string; accent?: string; subtitle?: string; scene?: SceneKind }) {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-20 text-white sm:py-24">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sceneDataUri(scene, `hero-${title}`)} alt="" className="absolute inset-0 h-full w-full animate-ken-burns object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-slate-900/40" />
      <Reveal className="container relative text-center">
        <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">{eyebrow}</span>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {title} {accent && <span className="text-brand-300">{accent}</span>}
        </h1>
        {subtitle && <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">{subtitle}</p>}
      </Reveal>
    </section>
  );
}
