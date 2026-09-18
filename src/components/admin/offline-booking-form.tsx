'use client';

import { useRef, useState, useTransition } from 'react';
import { createOfflineBooking } from '@/app/admin/bookings/actions';

interface RoomTypeOption {
  id: string;
  name: string;
  basePrice: number;
  maxGuests: number;
  totalRooms: number;
}

export function OfflineBookingForm({ roomTypes }: { roomTypes: RoomTypeOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; error?: string; bookingCode?: string } | null>(
    null,
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createOfflineBooking(formData);
      setResult(res);
      if (res.success) formRef.current?.reset();
    });
  }

  return (
    <div className="rounded-xl border border-ink-900/8 bg-white p-6 shadow-card">
      <h2 className="font-serif text-lg text-ink-900">Create Offline / Phone / Walk-in Booking</h2>
      <p className="mt-1 text-sm text-ink-900/50">
        This immediately reserves the room(s) against live availability — the website will show the
        reduced count right away, exactly like a booking made online.
      </p>

      <form ref={formRef} onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <select name="source" required defaultValue="WALK_IN" className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm">
          <option value="WALK_IN">Walk-in</option>
          <option value="PHONE">Phone</option>
          <option value="OFFLINE">Offline / Travel Agent</option>
        </select>

        <select name="roomTypeId" required defaultValue="" className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm">
          <option value="" disabled>Select room type…</option>
          {roomTypes.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.name} — ₹{rt.basePrice.toLocaleString('en-IN')}/night ({rt.totalRooms} units)
            </option>
          ))}
        </select>

        <label className="flex flex-col gap-1 text-xs text-ink-900/50">
          Check-in
          <input name="checkIn" type="date" required className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm text-ink-900" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-900/50">
          Check-out
          <input name="checkOut" type="date" required className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm text-ink-900" />
        </label>

        <input name="roomsBooked" type="number" min={1} defaultValue={1} required placeholder="Rooms" className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm" />
        <input name="guestsCount" type="number" min={1} defaultValue={2} required placeholder="Total Guests" className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm" />

        <input name="guestName" required placeholder="Guest Full Name" className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm" />
        <input name="guestPhone" required placeholder="Guest Phone" className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm" />
        <input name="guestEmail" type="email" placeholder="Guest Email (optional)" className="sm:col-span-2 rounded-md border border-ink-900/15 px-3 py-2.5 text-sm" />
        <textarea name="specialRequests" placeholder="Notes / special requests (optional)" rows={2} className="sm:col-span-2 rounded-md border border-ink-900/15 px-3 py-2.5 text-sm" />

        <label className="sm:col-span-2 flex items-center gap-2 text-sm text-ink-900/70">
          <input type="checkbox" name="markPaid" className="h-4 w-4 rounded border-ink-900/25" />
          Payment already collected at desk (mark as paid immediately)
        </label>

        <div className="sm:col-span-2 flex items-center gap-4">
          <button type="submit" disabled={pending} className="btn-gold disabled:opacity-50">
            {pending ? 'Creating…' : 'Create Booking'}
          </button>
          {result?.success && (
            <p className="text-sm font-medium text-sea-600">
              Booked — confirmation code {result.bookingCode}. Availability updated.
            </p>
          )}
          {result && !result.success && <p className="text-sm font-medium text-red-600">{result.error}</p>}
        </div>
      </form>
    </div>
  );
}
