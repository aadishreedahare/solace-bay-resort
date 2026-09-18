'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

interface Props {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  roomName: string;
  price: {
    nights: number;
    averageNightlyRate: number;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
  };
}

export function BookingReviewForm({ roomTypeId, checkIn, checkOut, rooms, guests, roomName, price }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', specialRequests: '' });
  const [couponCode, setCouponCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-900/60">Full Name</span>
            <input
              required
              value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              className="w-full rounded-md border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-900/60">Phone Number</span>
            <input
              required
              value={form.guestPhone}
              onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
              className="w-full rounded-md border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-900/60">Email</span>
          <input
            required
            type="email"
            value={form.guestEmail}
            onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-900/60">Special Requests (optional)</span>
          <textarea
            rows={3}
            value={form.specialRequests}
            onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-900/60">Coupon Code (optional)</span>
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
          />
        </label>

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
