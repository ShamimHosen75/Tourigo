import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Users, UserCheck } from 'lucide-react';
import { getCategories, getPackage, getPackages } from '@/lib/data';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PackageGallery } from '@/components/packages/PackageGallery';
import { PackageDetail } from '@/components/packages/PackageDetail';
import { Reveal } from '@/components/ui/Reveal';

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getPackages()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const pkg = await getPackage((await params).slug);
  return pkg ? { title: pkg.title, description: pkg.shortDescription } : {};
}

export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await getPackage(slug);
  if (!pkg) notFound();
  const category = (await getCategories()).find((c) => c.slug === pkg.categorySlug);

  return (
    <>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Packages', href: '/packages' }, { label: pkg.title }]} backHref="/packages" />
      <div className="container pb-10 pt-8">
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
            {category && <span className="chip bg-brand-50 text-brand-600">{category.title}</span>}
            <span className="chip bg-amber-50 text-amber-600">{pkg.level}</span>
            <span className="chip bg-slate-100 normal-case text-ink-soft">
              {pkg.durationDays} Day{pkg.durationDays > 1 ? 's' : ''}
              {pkg.durationNights ? ` / ${pkg.durationNights} Night${pkg.durationNights > 1 ? 's' : ''}` : ''}
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{pkg.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip border border-brand-100 bg-white text-brand-600">
              <UserCheck className="h-3.5 w-3.5" /> Age: {pkg.ageGroup}
            </span>
            <span className="chip border border-slate-200 bg-white text-ink-soft">
              <Users className="h-3.5 w-3.5" /> {pkg.gender === 'Both' ? 'Open for All Genders' : pkg.gender}
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="mt-6">
          <PackageGallery images={pkg.images} scene={pkg.scene} seed={pkg.slug} title={pkg.title} />
        </Reveal>
        <PackageDetail pkg={pkg} />
      </div>
    </>
  );
}
