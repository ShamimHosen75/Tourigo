import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      sections={[
        { heading: 'What we collect', body: 'When you book or contact us we collect your name, email, phone number and trip preferences. We do not collect payment card details on this website.' },
        { heading: 'How we use it', body: 'Only to confirm and run your trip, share updates and, if you agree, send occasional offers. We never sell your data.' },
        { heading: 'Sharing', body: 'Necessary details (such as names and ID numbers) are shared with hotels, transport operators and authorities only as required for your trip.' },
        { heading: 'Your rights', body: 'You can ask us to view, correct or delete your personal information at any time by contacting our support email.' },
      ]}
    />
  );
}
