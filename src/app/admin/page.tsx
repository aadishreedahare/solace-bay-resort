import { CalendarCheck, CalendarX, BedDouble, DoorClosed, IndianRupee, Clock, XCircle, ListChecks } from 'lucide-react';
import { db } from '@/server/db';
import { StatCard } from '@/components/admin/stat-card';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

async function getStats() {
  const today0 = startOfDay();
  const today1 = endOfDay();

  const [
    totalBookings,
    checkInsToday,
    checkOutsToday,
    totalRoomsAgg,
    occupiedNow,
    revenueAgg,
    pendingPayments,
    cancelledCount,
    recentBookings,
  ] = await Promise.all([
    db.booking.count(),
    db.booking.count({ where: { checkIn: { gte: today0, lte: today1 }, status: { in: ['CONFIRMED', 'PENDING'] } } }),
    db.booking.count({ where: { checkOut: { gte: today0, lte: today1 }, status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
    db.roomType.aggregate({ _sum: { totalRooms: true } }),
    db.booking.aggregate({
      _sum: { roomsBooked: true },
      where: { status: { in: ['CONFIRMED', 'PENDING'] }, checkIn: { lte: today1 }, checkOut: { gte: today0 } },
    }),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
    db.payment.count({ where: { status: 'PENDING' } }),
    db.booking.count({ where: { status: 'CANCELLED' } }),
    db.booking.findMany({
      include: { roomType: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ]);

  const totalRooms = totalRoomsAgg._sum.totalRooms ?? 0;
  const occupied = occupiedNow._sum.roomsBooked ?? 0;

  return {
    totalBookings,
    checkInsToday,
    checkOutsToday,
    availableRooms: Math.max(0, totalRooms - occupied),
    occupiedRooms: occupied,
    revenue: Number(revenueAgg._sum.amount ?? 0),
    pendingPayments,
    cancelledCount,
    recentBookings,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats().catch(() => null);

  if (!stats) {
    return (
      <div>
        <h1 className="font-serif text-2xl text-ink-900">Dashboard</h1>
        <p className="mt-4 text-sm text-ink-900/60">
          Could not load stats — make sure the database is migrated and seeded (see README).
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink-900">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-900/50">Overview of today&rsquo;s operations.</p>

      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Total Bookings" value={String(stats.totalBookings)} icon={ListChecks} />
        <StatCard label="Today's Check-ins" value={String(stats.checkInsToday)} icon={CalendarCheck} />
        <StatCard label="Today's Check-outs" value={String(stats.checkOutsToday)} icon={CalendarX} />
        <StatCard label="Available Rooms" value={String(stats.availableRooms)} icon={BedDouble} />
        <StatCard label="Occupied Rooms" value={String(stats.occupiedRooms)} icon={DoorClosed} />
        <StatCard label="Revenue (Paid)" value={formatCurrency(stats.revenue)} icon={IndianRupee} />
        <StatCard label="Pending Payments" value={String(stats.pendingPayments)} icon={Clock} accent="warning" />
        <StatCard label="Cancelled Bookings" value={String(stats.cancelledCount)} icon={XCircle} accent="danger" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-ink-900/8 bg-white p-6 shadow-card">
          <h2 className="font-serif text-lg text-ink-900">Revenue — Last 14 Days</h2>
          <div className="mt-4 h-64">
            <RevenueChart />
          </div>
        </div>

        <div className="rounded-xl border border-ink-900/8 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs font-semibold text-gold-600 hover:underline">View all →</Link>
          </div>
          <div className="mt-4 space-y-4">
            {stats.recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-ink-900/5 pb-3 text-sm last:border-0">
                <div>
                  <p className="font-medium text-ink-900">{b.guestName}</p>
                  <p className="text-xs text-ink-900/50">{b.roomType.name} · {formatDate(b.checkIn)}</p>
                </div>
                <span className="text-xs font-semibold text-ink-900/60">{b.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
