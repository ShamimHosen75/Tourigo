import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Compass className="h-16 w-16 animate-[spin_6s_linear_infinite] text-brand-400" />
      <h1 className="mt-6 font-display text-4xl font-extrabold">Lost on the trail?</h1>
      <p className="mt-2 text-ink-mute">The page you are looking for doesn’t exist or has moved.</p>
      <Link href="/" className="btn-primary mt-6">Back to Home</Link>
    </div>
  );
}
