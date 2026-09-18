import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { db } from '@/server/db';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function BookingConfirmationPage({ params }: { params: { bookingId: string } }) {
  const booking = await db.booking.findUnique({
    where: { id: params.bookingId },
    include: { roomType: true, payment: true },
  });
  if (!booking) notFound();

  const isConfirmed = booking.status === 'CONFIRMED';

  return (
    <div className="container-site max-w-xl py-20 text-center">
      <CheckCircle2 className={`mx-auto h-14 w-14 ${isConfirmed ? 'text-sea-500' : 'text-gold-500'}`} strokeWidth={1.5} />
      <p className="eyebrow mt-6">Step 3 of 3</p>
      <h1 className="mt-2 font-serif text-3xl text-ink-900">
        {isConfirmed ? 'Booking Confirmed' : 'Booking Received'}
      </h1>
      <p className="mt-3 text-sm text-ink-900/65">
        {isConfirmed
          ? `A confirmation has been sent to ${booking.guestEmail}.`
          : 'We are finalizing your payment confirmation — this page will update automatically once it clears.'}
      </p>

      <div className="mt-10 rounded-xl border border-ink-900/10 bg-white p-8 text-left shadow-card">
        <div className="flex items-center justify-between border-b border-ink-900/8 pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-900/50">Booking Reference</span>
          <span className="font-serif text-lg text-ink-900">{booking.bookingCode}</span>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Room" value={booking.roomType.name} />
          <Row label="Check-in" value={formatDate(booking.checkIn)} />
          <Row label="Check-out" value={formatDate(booking.checkOut)} />
          <Row label="Rooms / Guests" value={`${booking.roomsBooked} room(s), ${booking.guestsCount} guest(s)`} />
          <Row label="Total Paid" value={formatCurrency(Number(booking.totalAmount))} />
        </dl>
      </div>

      <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
        <Link href="/account/bookings" className="btn-primary">View My Bookings</Link>
        <Link href="/" className="btn-secondary">Back to Home</Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-900/55">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}
