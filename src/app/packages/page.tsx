import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCategories, getPackages } from '@/lib/data';
import { toCard } from '@/lib/cards';
import { PageHero } from '@/components/ui/PageHero';
import { PackagesExplorer } from '@/components/packages/PackagesExplorer';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Tour Packages', description: 'Browse treks, tours and travel packages across Bangladesh.' };

export default async function PackagesPage() {
  const [packages, categories] = await Promise.all([getPackages(), getCategories()]);
  const items = packages.map((p) => ({ ...toCard(p), categorySlug: p.categorySlug, region: p.region }));
  return (
    <>
      <PageHero eyebrow="Packages" title="Explore Our" accent="Tour Packages" subtitle="Hill treks, island escapes, forest safaris and heritage walks — all priced in BDT with weekly departures." scene="hills" />
      <div className="container">
        <Suspense>
          <PackagesExplorer items={items} categories={categories} />
        </Suspense>
      </div>
    </>
  );
}
