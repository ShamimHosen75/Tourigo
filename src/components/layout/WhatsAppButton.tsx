import { siteConfig } from '@/config/site';

export function WhatsAppIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.1c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.7 12.7-12.6C28.7 8.6 23 3 16 3zm0 23.2c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.1 1.2 1.3-4-.3-.4c-1.1-1.7-1.7-3.6-1.7-5.6C5.4 9.8 10.2 5.1 16 5.1s10.6 4.7 10.6 10.5S21.8 26.2 16 26.2zm5.8-7.8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1c-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2.1-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.7 1.2 3.1 1.4 3.4c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
    </svg>
  );
}

export function WhatsAppButton() {
  const href = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(`Hi ${siteConfig.name}! I want to know about your trips.`)}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="group fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-xl shadow-emerald-600/30 transition hover:scale-110">
      <span className="absolute inset-0 animate-ping2 rounded-full bg-[#25d366]/60" />
      <WhatsAppIcon className="relative h-7 w-7" />
      <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold ring-2 ring-white">1</span>
      <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium opacity-0 transition group-hover:opacity-100">Chat with us</span>
    </a>
  );
}
