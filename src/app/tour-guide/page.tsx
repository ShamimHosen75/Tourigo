import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { TourGuideExplorer } from '@/components/guide/TourGuideExplorer';

export const metadata: Metadata = {
  title: 'A to Z Tour Guide & Transit Route Map | Tourigo',
  description:
    'Plan your journey from origin to destination across Bangladesh. Detailed transit processes, bus & train schedules, military convoy escort times, and interactive A-to-Z travel cost calculator.',
  openGraph: {
    title: 'A to Z Tour Guide & Transit Route Map | Tourigo',
    description:
      'Step-by-step transit roadmap and live cost calculator from Dhaka, Chattogram and Sylhet to Sajek, Saint Martin, Cox’s Bazar, Bandarban and more.',
  },
};

export default async function TourGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const from = params.from || 'dhaka';
  const to = params.to || 'sajek';

  return (
    <main className="min-h-screen bg-paper pb-20 pt-4">
      <div className="container max-w-[1400px]">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'A to Z Tour Guide & Route Map' },
          ]}
          backHref="/"
        />
        <div className="mt-6">
          <TourGuideExplorer initialOrigin={from} initialDestination={to} />
        </div>
      </div>
    </main>
  );
}
