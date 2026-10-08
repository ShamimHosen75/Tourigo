import { siteConfig } from '@/config/site';
import { PageHero } from '@/components/ui/PageHero';

export function LegalPage({ title, sections }: { title: string; sections: { heading: string; body: string }[] }) {
  return (
    <>
      <PageHero eyebrow="Policies" title={title} scene="lake" />
      <article className="container mt-12 max-w-3xl space-y-8">
        <p className="text-sm text-ink-mute">Last updated: October 2026. These terms apply to all trips booked with {siteConfig.name}.</p>
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-bold">{s.heading}</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
          </section>
        ))}
      </article>
    </>
  );
}
