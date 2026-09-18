import { notFound } from 'next/navigation';
import { db } from '@/server/db';
import { PaymentPanel } from '@/components/site/payment-panel';
import { formatCurrency } from '@/lib/utils';

export default async function BookingPaymentPage({
  searchParams,
}: {
  searchParams: { bookingId?: string };
}) {
  if (!searchParams.bookingId) notFound();

  const booking = await db.booking.findUnique({
    where: { id: searchParams.bookingId },
    include: { roomType: true },
  });
  if (!booking) notFound();

  return (
    <div className="container-site max-w-lg py-16">
      <p className="eyebrow">Step 2 of 3</p>
      <h1 className="mt-2 font-serif text-3xl text-ink-900">Payment</h1>

      <div className="mt-8 rounded-xl border border-ink-900/10 bg-white p-6 shadow-card">
        <div className="flex justify-between text-sm text-ink-900/70">
          <span>Booking Reference</span>
          <span className="font-semibold text-ink-900">{booking.bookingCode}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-ink-900/70">
          <span>{booking.roomType.name}</span>
          <span>{booking.roomsBooked} room(s) · {booking.nights} night(s)</span>
        </div>
        <div className="mt-4 flex justify-between border-t border-ink-900/8 pt-4 font-semibold text-ink-900">
          <span>Amount Payable</span>
          <span>{formatCurrency(Number(booking.totalAmount))}</span>
        </div>
      </div>

      <PaymentPanel
        bookingId={booking.id}
        amount={Number(booking.totalAmount)}
        guestName={booking.guestName}
        guestEmail={booking.guestEmail}
        guestPhone={booking.guestPhone}
      />
    </div>
  );
}
