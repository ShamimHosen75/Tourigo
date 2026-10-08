'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';
import type { BookingInput, EnquiryInput } from '@/lib/types';

export type ActionResult = { ok: true; reference: string; demo: boolean } | { ok: false; error: string };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^\+?[0-9\s-]{10,16}$/;

function reference(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, '0')}`;
}

/** Saves a booking enquiry. No payment is taken — the team confirms by phone. */
export async function submitBooking(input: BookingInput): Promise<ActionResult> {
  if (!input.fullName?.trim() || input.fullName.trim().length < 2) return { ok: false, error: 'Please enter your full name.' };
  if (!emailRe.test(input.email ?? '')) return { ok: false, error: 'Please enter a valid email address.' };
  if (!phoneRe.test(input.phone ?? '')) return { ok: false, error: 'Please enter a valid phone number.' };
  if (!input.batchId) return { ok: false, error: 'Please select a departure batch.' };
  if (!Number.isInteger(input.travelers) || input.travelers < 1 || input.travelers > 20) {
    return { ok: false, error: 'Number of travellers must be between 1 and 20.' };
  }

  const ref = reference('BK');
  const sb = getSupabase();
  if (!sb) return { ok: true, reference: ref, demo: true };

  const { error } = await sb.from('bookings').insert({
    reference: ref,
    package_slug: input.packageSlug,
    package_title: input.packageTitle,
    batch_id: input.batchId,
    batch_label: input.batchLabel,
    travelers: input.travelers,
    pickup_point_id: input.pickupPointId,
    pickup_point_name: input.pickupPointName,
    total_amount: input.totalAmount,
    full_name: input.fullName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    notes: input.notes?.trim() || null,
  });
  if (error) {
    console.error('[supabase] booking insert failed:', error);
    return { ok: false, error: error.message.includes('seats') ? 'Not enough seats left in this batch.' : 'Could not submit right now. Please try again or call us.' };
  }
  revalidatePath(`/packages/${input.packageSlug}`); // refresh "slots left"
  return { ok: true, reference: ref, demo: false };
}

/** Contact form / "Still have questions" enquiries. */
export async function submitEnquiry(input: EnquiryInput): Promise<ActionResult> {
  if (!input.name?.trim()) return { ok: false, error: 'Please enter your name.' };
  if (!emailRe.test(input.email ?? '')) return { ok: false, error: 'Please enter a valid email address.' };
  if (!input.message?.trim() || input.message.trim().length < 5) return { ok: false, error: 'Please write a short message.' };

  const ref = reference('EQ');
  const sb = getSupabase();
  if (!sb) return { ok: true, reference: ref, demo: true };

  const { error } = await sb.from('enquiries').insert({
    reference: ref,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    subject: input.subject?.trim() || null,
    message: input.message.trim(),
  });
  if (error) {
    console.error('[supabase] enquiry insert failed:', error);
    return { ok: false, error: 'Could not send right now. Please try again or call us.' };
  }
  return { ok: true, reference: ref, demo: false };
}
