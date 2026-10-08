import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

/** Brand mark. Set siteConfig.logo to use your own image. */
export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={`${siteConfig.name} home`}>
      {siteConfig.logo ? (
        <Image src={siteConfig.logo} alt="" width={48} height={48} className={`${box} object-contain`} />
      ) : (
        <span className={`${box} grid place-items-center rounded-full bg-gradient-to-br from-brand-400 to-emerald-500 text-white shadow-md transition group-hover:rotate-[-8deg]`}>
          <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 24 L11 12 L16 19 L20 14 L29 24 Z" fill="currentColor" fillOpacity=".25" />
            <path d="M18 7 q3 -2 6 0 q-3 -1 -6 0 Z M21 6 q2 -3 5 -2" />
          </svg>
        </span>
      )}
      <span className="leading-none">
        <span className={`block font-script ${size === 'lg' ? 'text-3xl' : 'text-[1.6rem]'} font-bold`}>
          <span className="text-brand-500">{siteConfig.name.split(' ')[0]}</span>{' '}
          <span className="text-accent-500">{siteConfig.name.split(' ').slice(1).join(' ')}</span>
        </span>
        <span className="mt-0.5 block text-[11px] font-medium text-ink-mute">{siteConfig.tagline}</span>
      </span>
    </Link>
  );
}
