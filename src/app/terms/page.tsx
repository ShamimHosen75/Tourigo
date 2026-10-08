import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      sections={[
        { heading: 'Bookings', body: 'A booking request reserves seats for 48 hours. It becomes confirmed once our team has called you and the advance payment (bKash, Nagad, Rocket or bank transfer) has been received.' },
        { heading: 'Prices', body: 'All prices are in Bangladeshi Taka (BDT) per person unless stated otherwise. Prices may change because of fuel costs, government fees or seasonal demand; confirmed bookings are not affected.' },
        { heading: 'Identity documents', body: 'Travellers must carry a valid National ID, passport or student ID. Hill tract trips require ID copies for army check-posts.' },
        { heading: 'Conduct', body: 'Travellers must follow the trip leader’s instructions, respect local communities and the environment. Alcohol and drugs are not allowed. We may remove anyone who endangers the group, without refund.' },
        { heading: 'Liability', body: 'Adventure travel has inherent risks. We take every reasonable precaution but are not liable for delays or losses caused by weather, natural events, strikes, government decisions or other circumstances beyond our control.' },
      ]}
    />
  );
}
