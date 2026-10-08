import type { Metadata, Viewport } from 'next';
import { Dancing_Script, Inter, Outfit } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/config/site';
import { TopTicker } from '@/components/layout/TopTicker';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { getFeaturedPackages } from '@/lib/data';

const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const display = Outfit({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700', '800'], display: 'swap' });
const script = Dancing_Script({ subsets: ['latin'], variable: '--font-script', weight: ['600', '700'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: `${siteConfig.name} | Discover & Book Treks, Tours & Travel Packages in Bangladesh`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: { type: 'website', siteName: siteConfig.name, description: siteConfig.description },
};

export const viewport: Viewport = { themeColor: '#00aef0' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const featured = await getFeaturedPackages();
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${script.variable}`}>
      <body className="min-h-screen font-sans">
        <header className="sticky top-0 z-50">
          <TopTicker />
          <Navbar />
        </header>
        <main>{children}</main>
        <Footer featured={featured.slice(0, 5).map((p) => ({ title: p.title, slug: p.slug }))} />
        <WhatsAppButton />
      </body>
    </html>
  );
}
