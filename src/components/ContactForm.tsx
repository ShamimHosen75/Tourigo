'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { submitEnquiry, type ActionResult } from '@/app/actions';

export function ContactForm() {
  const empty = { name: '', email: '', phone: '', subject: '', message: '' };
  const [form, setForm] = useState(empty);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  if (result?.ok) {
    return (
      <div className="card flex flex-col items-center p-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <h3 className="mt-4 text-xl font-bold">Message sent!</h3>
        <p className="mt-2 text-sm text-ink-mute">We’ll get back to you within one working day. Reference: <b>{result.reference}</b></p>
        {result.demo && <p className="mt-2 text-xs text-amber-600">Demo mode — connect Supabase to store enquiries.</p>}
        <button className="btn-ghost mt-6" onClick={() => { setForm(empty); setResult(null); }}>Send another</button>
      </div>
    );
  }

  return (
    <form
      className="card space-y-4 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setResult(await submitEnquiry(form)));
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <input required className="input" placeholder="Your name" value={form.name} onChange={set('name')} autoComplete="name" />
        <input required type="email" className="input" placeholder="Email address" value={form.email} onChange={set('email')} autoComplete="email" />
        <input type="tel" className="input" placeholder="Phone (optional)" value={form.phone} onChange={set('phone')} autoComplete="tel" />
        <select className="input" value={form.subject} onChange={set('subject')}>
          <option value="">What is it about?</option>
          <option>Package enquiry</option>
          <option>Customized tour</option>
          <option>Group / corporate trip</option>
          <option>Campus tour</option>
          <option>Existing booking</option>
          <option>Other</option>
        </select>
      </div>
      <textarea required rows={5} className="input resize-none" placeholder="Tell us your dates, destination, group size and budget…" value={form.message} onChange={set('message')} />
      {result && !result.ok && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{result.error}</p>}
      <button disabled={pending} className="btn-primary w-full sm:w-auto">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send Message
      </button>
    </form>
  );
}
