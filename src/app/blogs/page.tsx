import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { getBlogPosts } from '@/lib/data';
import { formatDate } from '@/lib/dates';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { SmartImage } from '@/components/ui/SmartImage';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Blogs & Travel Guides', description: 'Travel guides, checklists and stories from across Bangladesh.' };

export default async function BlogsPage() {
  const posts = await getBlogPosts();
  return (
    <>
      <PageHero eyebrow="Blogs & Articles" title="Stories &" accent="Travel Guides" subtitle="Tips, checklists and destination guides to plan your next trip in Bangladesh." scene="forest" />
      <div className="container mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 0.08}>
            <Link href={`/blogs/${p.slug}`} className="card group block h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-card">
              <div className="aspect-[16/10] overflow-hidden">
                <SmartImage src={p.image} scene={p.scene} seed={p.slug} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="chip bg-brand-50 text-[10px] text-brand-600">{t}</span>
                  ))}
                </div>
                <h2 className="mt-3 text-lg font-bold leading-snug group-hover:text-brand-600">{p.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-ink-mute">{p.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-ink-mute">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDate(p.publishedAt)} • {p.readMinutes} min read</span>
                  <ArrowRight className="h-4 w-4 text-brand-500 transition group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
