import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { db } from '@/server/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CancelBookingButton } from '@/components/site/cancel-booking-button';

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const booking = await db.booking.findUnique({
    where: { id: params.id },
    include: { roomType: true, payment: true, guests: true },
  });
  if (!booking || booking.userId !== session.user.id) notFound();

  const canCancel = booking.status === 'CONFIRMED' || booking.status === 'PENDING';

  return (
    <div className="container-site max-w-2xl py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-900/50">{booking.bookingCode}</p>
      <h1 className="mt-1 font-serif text-3xl text-ink-900">{booking.roomType.name}</h1>

      <div className="mt-8 rounded-xl border border-ink-900/10 bg-white p-7 shadow-card">
        <dl className="space-y-3 text-sm">
          <Row label="Status" value={booking.status} />
          <Row label="Check-in" value={formatDate(booking.checkIn)} />
          <Row label="Check-out" value={formatDate(booking.checkOut)} />
          <Row label="Rooms / Guests" value={`${booking.roomsBooked} room(s), ${booking.guestsCount} guest(s)`} />
          <Row label="Subtotal" value={formatCurrency(Number(booking.subtotal))} />
          <Row label="Taxes" value={formatCurrency(Number(booking.taxAmount))} />
          {Number(booking.discountAmount) > 0 && <Row label="Discount" value={`-${formatCurrency(Number(booking.discountAmount))}`} />}
          <Row label="Total" value={formatCurrency(Number(booking.totalAmount))} />
          <Row label="Payment Status" value={booking.payment?.status ?? 'PENDING'} />
        </dl>
      </div>

      {booking.status === 'CANCELLED' && booking.refundAmount != null && (
        <div className="mt-6 rounded-lg bg-sand-100 p-4 text-sm text-ink-900/70">
          Cancelled on {formatDate(booking.cancelledAt!)} — refund amount: {formatCurrency(Number(booking.refundAmount))}
        </div>
      )}

      {canCancel && (
        <div className="mt-8">
          <CancelBookingButton bookingId={booking.id} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-ink-900/5 pb-2">
      <dt className="text-ink-900/55">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}
