import { db } from '@/server/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OfflineBookingForm } from '@/components/admin/offline-booking-form';
import { BookingRowActions } from '@/components/admin/booking-row-actions';
import type { BookingStatus, Prisma } from '@prisma/client';

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: 'bg-gold-500/10 text-gold-700',
  CONFIRMED: 'bg-sea-500/10 text-sea-600',
  CANCELLED: 'bg-red-500/10 text-red-600',
  COMPLETED: 'bg-ink-900/10 text-ink-900/60',
  NO_SHOW: 'bg-ink-900/10 text-ink-900/40',
};

const SOURCE_LABEL: Record<string, string> = {
  WEBSITE: 'Website',
  OFFLINE: 'Offline',
  PHONE: 'Phone',
  WALK_IN: 'Walk-in',
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string; roomTypeId?: string; q?: string; from?: string; to?: string };
}) {
  const roomTypes = await db.roomType.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, basePrice: true, maxGuests: true, totalRooms: true },
  });

  const where: Prisma.BookingWhereInput = {};

  if (searchParams.status) where.status = searchParams.status as BookingStatus;
  if (searchParams.roomTypeId) where.roomTypeId = searchParams.roomTypeId;
  if (searchParams.from || searchParams.to) {
    where.checkIn = {
      ...(searchParams.from ? { gte: new Date(searchParams.from) } : {}),
      ...(searchParams.to ? { lte: new Date(searchParams.to) } : {}),
    };
  }
  if (searchParams.q) {
    where.OR = [
      { guestName: { contains: searchParams.q, mode: 'insensitive' } },
      { guestEmail: { contains: searchParams.q, mode: 'insensitive' } },
      { guestPhone: { contains: searchParams.q, mode: 'insensitive' } },
      { bookingCode: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }

  const bookings = await db.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { roomType: { select: { name: true } }, payment: { select: { status: true } } },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink-900">Booking Management</h1>
      <p className="mt-1 text-sm text-ink-900/50">
        Every booking — from the website or taken by staff — lives here. Offline bookings created below
        immediately reduce live availability shown on the site.
      </p>

      <div className="mt-8">
        <OfflineBookingForm
          roomTypes={roomTypes.map((rt) => ({ ...rt, basePrice: Number(rt.basePrice) }))}
        />
      </div>

      <form className="mt-10 flex flex-wrap items-end gap-3 rounded-xl border border-ink-900/8 bg-white p-4 shadow-card">
        <label className="flex flex-col gap-1 text-xs text-ink-900/50">
          Search
          <input name="q" defaultValue={searchParams.q} placeholder="Name, email, phone, code…" className="w-56 rounded-md border border-ink-900/15 px-3 py-2 text-sm text-ink-900" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-900/50">
          Status
          <select name="status" defaultValue={searchParams.status ?? ''} className="rounded-md border border-ink-900/15 px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No-show</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-900/50">
          Room Type
          <select name="roomTypeId" defaultValue={searchParams.roomTypeId ?? ''} className="rounded-md border border-ink-900/15 px-3 py-2 text-sm">
            <option value="">All</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>{rt.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-900/50">
          Check-in from
          <input name="from" type="date" defaultValue={searchParams.from} className="rounded-md border border-ink-900/15 px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-900/50">
          to
          <input name="to" type="date" defaultValue={searchParams.to} className="rounded-md border border-ink-900/15 px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="rounded-md bg-ink-900 px-4 py-2 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-900/8 bg-white shadow-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-ink-900/8 bg-sand-100/60 text-xs uppercase tracking-wider text-ink-900/50">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Guest</th>
              <th className="px-4 py-3 text-left">Room</th>
              <th className="px-4 py-3 text-left">Stay</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-ink-900/5 last:border-0 align-top">
                <td className="px-4 py-4 font-mono text-xs text-ink-900/70">{b.bookingCode}</td>
                <td className="px-4 py-4">
                  <div className="font-medium text-ink-900">{b.guestName}</div>
                  <div className="text-xs text-ink-900/50">{b.guestPhone}</div>
                </td>
                <td className="px-4 py-4 text-ink-900/70">{b.roomType.name} × {b.roomsBooked}</td>
                <td className="px-4 py-4 text-xs text-ink-900/70">
                  {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                  <div className="text-ink-900/40">{b.nights} night{b.nights > 1 ? 's' : ''}</div>
                </td>
                <td className="px-4 py-4 text-xs text-ink-900/60">{SOURCE_LABEL[b.source] ?? b.source}</td>
                <td className="px-4 py-4 font-medium text-ink-900">
                  {formatCurrency(Number(b.totalAmount))}
                  <div className="text-xs font-normal text-ink-900/40">
                    {b.payment?.status === 'PAID' ? 'Paid' : 'Payment pending'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <BookingRowActions bookingId={b.id} status={b.status} paymentStatus={b.payment?.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-900/50">No bookings match these filters.</p>
        )}
      </div>
    </div>
  );
}
