import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPost, getBlogPosts } from '@/lib/data';
import { formatDate } from '@/lib/dates';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { SmartImage } from '@/components/ui/SmartImage';
import { Reveal } from '@/components/ui/Reveal';

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getBlogPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getBlogPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getBlogPost((await params).slug);
  if (!post) notFound();
  const more = (await getBlogPosts()).filter((p) => p.slug !== post.slug).slice(0, 3);
  return (
    <>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blogs', href: '/blogs' }, { label: post.title }]} backHref="/blogs" />
      <article className="container max-w-3xl pt-10">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{post.tags.join(' • ')}</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-sm text-ink-mute">
            By {post.author} • {formatDate(post.publishedAt)} • {post.readMinutes} min read
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-6 overflow-hidden rounded-3xl shadow-card">
          <SmartImage src={post.image} scene={post.scene} seed={post.slug} alt={post.title} className="aspect-[16/9] w-full object-cover" />
        </Reveal>
        <div className="mt-8 space-y-5 text-[17px] leading-8 text-ink-soft">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>
      {more.length > 0 && (
        <section className="container mt-16 max-w-5xl">
          <h2 className="text-xl font-bold">More from the blog</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {more.map((p) => (
              <Link key={p.slug} href={`/blogs/${p.slug}`} className="card group overflow-hidden">
                <SmartImage src={p.image} scene={p.scene} seed={p.slug} alt={p.title} className="aspect-[16/10] w-full object-cover" />
                <p className="p-4 text-sm font-semibold group-hover:text-brand-600">{p.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
