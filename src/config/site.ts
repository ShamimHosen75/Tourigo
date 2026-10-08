// Brand settings live here. Replace the name, tagline, logo and contact details
// once the final branding is ready; every page reads from this file.
export const siteConfig = {
  name: 'Ghuri Trails',
  tagline: 'Never stop exploring',
  description:
    'Discover and book the best treks, tours and travel packages across Bangladesh — Sajek, Bandarban, Saint Martin, Sundarbans, Sylhet and more.',
  // Put your logo at public/logo.png (or .svg) and set the path here. Empty = built-in mark.
  logo: '',
  // Optional hero photos for each weather mode (e.g. '/hero/monsoon.jpg' in public/).
  // Empty = the built-in illustrated mountain scene.
  heroImages: { rain: '', bloom: '', snow: '' },
  country: 'Bangladesh',
  currency: { code: 'BDT', symbol: '৳', locale: 'en-BD' },
  contact: {
    phone: '+880 1700-000000',
    phoneHref: 'tel:+8801700000000',
    whatsapp: '8801700000000', // digits only, used for wa.me links
    email: 'support@example.com',
    address: 'Banani, Dhaka 1213, Bangladesh',
    hours: 'Sat – Thu, 10:00 AM – 8:00 PM',
  },
  social: {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    youtube: 'https://youtube.com/',
  },
  // Rolling announcement strip at the very top of every page.
  announcements: [
    { icon: '🏔️', text: 'Tours from Dhaka are now open', href: '/packages?category=tour-from-dhaka' },
    { icon: '🌊', text: 'Saint Martin season bookings open', href: '/packages/saint-martin-island-tour' },
    { icon: '🌿', text: 'Tours from Chattogram are now open', href: '/packages?category=tour-from-chattogram' },
    { badge: 'SPECIAL', text: 'Discounted prices available', href: '/packages' },
    { icon: '🍃', text: 'Tours from Sylhet are now open', href: '/packages?category=tour-from-sylhet' },
  ],
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Packages', href: '/packages' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Cancellation & Refund Policy', href: '/cancellation-policy' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
  ],
} as const;

export function formatPrice(amount: number) {
  return `${siteConfig.currency.symbol}${amount.toLocaleString('en-IN')}`;
}
