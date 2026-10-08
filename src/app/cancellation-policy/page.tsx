import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Cancellation & Refund Policy' };

export default function CancellationPage() {
  return (
    <LegalPage
      title="Cancellation & Refund Policy"
      sections={[
        { heading: '15 days or more before departure', body: 'Full refund minus a ৳500 processing fee per person.' },
        { heading: '7 to 14 days before departure', body: '50% of the paid amount is refunded.' },
        { heading: 'Less than 7 days before departure', body: 'No refund. You may transfer your seat to another person free of charge up to 24 hours before departure.' },
        { heading: 'Cancellation by us', body: 'If we cancel a trip because of weather, safety or low group size, you can choose a full refund or move to another batch free of charge.' },
        { heading: 'Refund timeline', body: 'Refunds are sent to the original payment method within 7 working days.' },
      ]}
    />
  );
}
