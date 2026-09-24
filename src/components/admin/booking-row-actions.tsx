'use client';

import { useTransition } from 'react';
import { updateBookingStatus, markBookingPaidManually } from '@/app/admin/bookings/actions';
import type { BookingStatus, PaymentStatus } from '@prisma/client';

const STYLES = {
  green: 'bg-sea-500/10 text-sea-600 hover:bg-sea-500/20',
  gold: 'bg-gold-500/10 text-gold-700 hover:bg-gold-500/20',
  grey: 'bg-ink-900/10 text-ink-900/60 hover:bg-ink-900/20',
  red: 'bg-red-500/10 text-red-600 hover:bg-red-500/20',
};

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
  const isOpen = status === 'PENDING' || status === 'CONFIRMED';
  const setStatus = (next: BookingStatus) => () => updateBookingStatus(bookingId, next);

  const actions = [
    { label: 'Confirm', show: status === 'PENDING', style: STYLES.green, run: setStatus('CONFIRMED') },
    { label: 'Mark Paid', show: isOpen && paymentStatus !== 'PAID', style: STYLES.gold, run: () => markBookingPaidManually(bookingId) },
    { label: 'Mark Completed', show: status === 'CONFIRMED', style: STYLES.grey, run: setStatus('COMPLETED') },
    { label: 'No-show', show: status === 'CONFIRMED', style: STYLES.grey, run: setStatus('NO_SHOW') },
    {
      label: 'Cancel',
      show: isOpen,
      style: STYLES.red,
      run: setStatus('CANCELLED'),
      confirm: 'Cancel this booking? This releases the room back into availability.',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions
        .filter((a) => a.show)
        .map((a) => (
          <button
            key={a.label}
            disabled={pending}
            onClick={() => {
              if (!a.confirm || confirm(a.confirm)) startTransition(a.run);
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-40 ${a.style}`}
          >
            {a.label}
          </button>
        ))}
    </div>
  );
}
