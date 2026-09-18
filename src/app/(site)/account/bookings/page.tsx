import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { db } from '@/server/db';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-sea-500/10 text-sea-600',
  PENDING: 'bg-gold-500/10 text-gold-600',
  CANCELLED: 'bg-red-500/10 text-red-600',
  COMPLETED: 'bg-ink-900/10 text-ink-900/70',
  NO_SHOW: 'bg-red-500/10 text-red-600',
};

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const bookings = await db.booking.findMany({
    where: { userId: session.user.id },
    include: { roomType: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container-site py-16">
      <h1 className="font-serif text-3xl text-ink-900">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-ink-900/15 p-12 text-center">
          <p className="text-sm text-ink-900/60">You haven&rsquo;t made any bookings yet.</p>
          <Link href="/rooms" className="btn-primary mt-5 inline-flex">Browse Rooms</Link>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={`/account/bookings/${b.id}`}
              className="flex flex-col justify-between gap-3 rounded-xl border border-ink-900/10 bg-white p-6 shadow-card sm:flex-row sm:items-center"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-900/50">{b.bookingCode}</p>
                <p className="mt-1 font-serif text-lg text-ink-900">{b.roomType.name}</p>
                <p className="mt-1 text-sm text-ink-900/60">
                  {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.roomsBooked} room(s)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-ink-900">{formatCurrency(Number(b.totalAmount))}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                  {b.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
