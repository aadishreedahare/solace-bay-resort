'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import type { PriceBreakdown } from '@/server/services/pricing.service';
import { TextField } from './text-field';

interface Props {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  roomName: string;
  price: PriceBreakdown;
}

export function BookingReviewForm({ roomTypeId, checkIn, checkOut, rooms, guests, roomName, price }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', specialRequests: '' });
  const [couponCode, setCouponCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof typeof form) => (value: string) => setForm({ ...form, [key]: value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId,
          checkIn,
          checkOut,
          roomsBooked: rooms,
          guestsCount: guests,
          ...form,
          couponCode: couponCode || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Could not create booking');

      router.push(`/booking/payment?bookingId=${json.booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="font-serif text-xl text-ink-900">Guest Details</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Full Name" required value={form.guestName} onChange={set('guestName')} />
          <TextField label="Phone Number" required value={form.guestPhone} onChange={set('guestPhone')} />
        </div>
        <TextField label="Email" type="email" required value={form.guestEmail} onChange={set('guestEmail')} />
        <TextField label="Special Requests (optional)" rows={3} value={form.specialRequests} onChange={set('specialRequests')} />
        <TextField label="Coupon Code (optional)" value={couponCode} onChange={(v) => setCouponCode(v.toUpperCase())} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-gold w-full sm:w-auto disabled:opacity-50">
          {submitting ? 'Processing…' : 'Continue to Payment'}
        </button>
      </form>

      <aside className="h-fit rounded-xl border border-ink-900/10 bg-white p-6 shadow-card">
        <h3 className="font-serif text-lg text-ink-900">{roomName}</h3>
        <p className="mt-1 text-xs text-ink-900/60">
          {checkIn} → {checkOut} · {rooms} room(s) · {guests} guest(s)
        </p>
        <div className="mt-5 space-y-2 border-t border-ink-900/8 pt-4 text-sm text-ink-900/70">
          <div className="flex justify-between"><span>{price.nights} night(s) subtotal</span><span>{formatCurrency(price.subtotal)}</span></div>
          <div className="flex justify-between"><span>Taxes &amp; fees</span><span>{formatCurrency(price.taxAmount)}</span></div>
          {price.discountAmount > 0 && (
            <div className="flex justify-between text-sea-600"><span>Discount</span><span>-{formatCurrency(price.discountAmount)}</span></div>
          )}
          <div className="flex justify-between border-t border-ink-900/8 pt-2 font-semibold text-ink-900">
            <span>Total</span><span>{formatCurrency(price.totalAmount)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
