'use client';

import { useTransition } from 'react';
import { updateBookingStatus, markBookingPaidManually } from '@/app/admin/bookings/actions';
import type { BookingStatus, PaymentStatus } from '@prisma/client';

export function BookingRowActions({
  bookingId,
  status,
  paymentStatus,
}: {
  bookingId: string;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === 'PENDING' && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => updateBookingStatus(bookingId, 'CONFIRMED'))}
          className="rounded-full bg-sea-500/10 px-3 py-1 text-xs font-semibold text-sea-600 hover:bg-sea-500/20 disabled:opacity-40"
        >
          Confirm
        </button>
      )}

      {paymentStatus !== 'PAID' && (status === 'PENDING' || status === 'CONFIRMED') && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => markBookingPaidManually(bookingId))}
          className="rounded-full bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-700 hover:bg-gold-500/20 disabled:opacity-40"
        >
          Mark Paid
        </button>
      )}

      {status === 'CONFIRMED' && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => updateBookingStatus(bookingId, 'COMPLETED'))}
          className="rounded-full bg-ink-900/10 px-3 py-1 text-xs font-semibold text-ink-900/60 hover:bg-ink-900/20 disabled:opacity-40"
        >
          Mark Completed
        </button>
      )}

      {status === 'CONFIRMED' && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => updateBookingStatus(bookingId, 'NO_SHOW'))}
          className="rounded-full bg-ink-900/10 px-3 py-1 text-xs font-semibold text-ink-900/60 hover:bg-ink-900/20 disabled:opacity-40"
        >
          No-show
        </button>
      )}

      {(status === 'PENDING' || status === 'CONFIRMED') && (
        <button
          disabled={pending}
          onClick={() => {
            if (confirm('Cancel this booking? This releases the room back into availability.')) {
              startTransition(() => updateBookingStatus(bookingId, 'CANCELLED'));
            }
          }}
          className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-500/20 disabled:opacity-40"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
