'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Search } from 'lucide-react';
import { isoDate } from '@/lib/utils';

export function BookingWidget({ variant = 'hero' }: { variant?: 'hero' | 'inline' }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(isoDate());
  const [checkOut, setCheckOut] = useState(isoDate(1));
  const [guests, setGuests] = useState(2);

  function handleSearch() {
    router.push(`/rooms?${new URLSearchParams({ checkIn, checkOut, guests: String(guests) })}`);
  }

  return (
    <div
      className={
        variant === 'hero'
          ? 'w-full max-w-4xl rounded-xl bg-white/95 p-4 shadow-card backdrop-blur sm:p-5'
          : 'w-full rounded-xl border border-ink-900/10 bg-white p-4 shadow-card sm:p-5'
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-900/60">
            <Calendar className="h-3.5 w-3.5" /> Check-in
          </span>
          <input
            type="date"
            value={checkIn}
            min={isoDate()}
            onChange={(e) => setCheckIn(e.target.value)}
            className="input"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-900/60">
            <Calendar className="h-3.5 w-3.5" /> Check-out
          </span>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="input"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-900/60">
            <Users className="h-3.5 w-3.5" /> Guests
          </span>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="input"
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} Guest{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </label>

        <button onClick={handleSearch} className="btn-gold h-[46px] gap-2">
          <Search className="h-4 w-4" /> Check Availability
        </button>
      </div>
    </div>
  );
}
