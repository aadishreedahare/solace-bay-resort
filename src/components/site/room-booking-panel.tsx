'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, isoDate } from '@/lib/utils';
import type { PriceBreakdown } from '@/server/services/pricing.service';

interface PriceResponse {
  availableRooms: number;
  price: PriceBreakdown;
}

export function RoomBookingPanel({
  roomTypeId,
  maxGuests,
  basePrice,
}: {
  roomTypeId: string;
  maxGuests: number;
  basePrice: number;
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(isoDate());
  const [checkOut, setCheckOut] = useState(isoDate(1));
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [data, setData] = useState<PriceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/availability?${new URLSearchParams({ checkIn, checkOut, roomTypeId })}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Could not check availability');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [checkIn, checkOut, roomTypeId]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  const total = data ? data.price.totalAmount * rooms : basePrice;
  const canBook = !!data && data.availableRooms >= rooms && rooms >= 1;

  function handleBookNow() {
    const params = new URLSearchParams({ roomTypeId, checkIn, checkOut, rooms: String(rooms), guests: String(guests) });
    router.push(`/booking/review?${params}`);
  }

  return (
    <div className="sticky top-28 rounded-xl border border-ink-900/10 bg-white p-6 shadow-card">
      <div className="flex items-baseline gap-1.5">
        <span className="font-serif text-2xl text-ink-900">{formatCurrency(basePrice)}</span>
        <span className="text-xs text-ink-900/50">/ night (from)</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-900/60">Check-in</span>
          <input
            type="date"
            value={checkIn}
            min={isoDate()}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded-md border border-ink-900/15 px-2.5 py-2 text-sm outline-none focus:border-gold-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-900/60">Check-out</span>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded-md border border-ink-900/15 px-2.5 py-2 text-sm outline-none focus:border-gold-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-900/60">Rooms</span>
          <select
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
            className="w-full rounded-md border border-ink-900/15 px-2.5 py-2 text-sm outline-none focus:border-gold-500"
          >
            {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-900/60">Guests</span>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-md border border-ink-900/15 px-2.5 py-2 text-sm outline-none focus:border-gold-500"
          >
            {Array.from({ length: maxGuests * rooms }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 space-y-2 border-t border-ink-900/8 pt-4 text-sm">
        {loading && <p className="text-ink-900/50">Checking availability…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {data && !loading && !error && (
          <>
            <Row label={`${formatCurrency(data.price.averageNightlyRate)} × ${data.price.nights} night(s) × ${rooms} room(s)`} value={formatCurrency(data.price.subtotal * rooms)} />
            <Row label="Taxes & fees" value={formatCurrency(data.price.taxAmount * rooms)} />
            <div className="flex items-center justify-between border-t border-ink-900/8 pt-2 font-semibold text-ink-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <p className={data.availableRooms > 0 ? 'text-xs text-sea-600' : 'text-xs text-red-600'}>
              {data.availableRooms > 0
                ? `${data.availableRooms} room(s) available for these dates`
                : 'No rooms available for these dates'}
            </p>
          </>
        )}
      </div>

      <button
        onClick={handleBookNow}
        disabled={!canBook}
        className="btn-gold mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        Book Now
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-ink-900/70">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
