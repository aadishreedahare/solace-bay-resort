import Link from 'next/link';
import { db } from '@/server/db';
import { getAvailableRoomCount, getBlockedPhysicalRooms } from '@/server/services/availability.service';

const DAYS_SHOWN = 21;

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function cellStyle(available: number, total: number) {
  if (total === 0) return 'bg-ink-900/5 text-ink-900/30';
  const ratio = available / total;
  if (available === 0) return 'bg-red-500/15 text-red-700 font-semibold';
  if (ratio <= 0.34) return 'bg-gold-500/15 text-gold-800 font-semibold';
  return 'bg-sea-500/10 text-sea-700';
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: { start?: string };
}) {
  const start = searchParams.start ? new Date(searchParams.start) : new Date();
  start.setHours(0, 0, 0, 0);

  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => addDays(start, i));

  const roomTypes = await db.roomType.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  const grid = await Promise.all(
    roomTypes.map(async (rt) => {
      const blocked = await getBlockedPhysicalRooms(rt.id);
      const cells = await Promise.all(
        days.map(async (day) => {
          const nextDay = addDays(day, 1);
          const available = await getAvailableRoomCount(rt.id, day, nextDay);
          return { date: day, available };
        }),
      );
      return { roomType: rt, blocked, cells };
    }),
  );

  const prevStart = addDays(start, -DAYS_SHOWN).toISOString().split('T')[0];
  const nextStart = addDays(start, DAYS_SHOWN).toISOString().split('T')[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink-900">Availability Calendar</h1>
          <p className="mt-1 text-sm text-ink-900/50">
            Live availability per room type, computed from current bookings (website + offline) and any
            units under maintenance. Same numbers the booking engine uses.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/calendar?start=${prevStart}`} className="rounded-md border border-ink-900/15 px-3 py-2 text-sm font-medium text-ink-900/70 hover:bg-sand-100">
            ← Previous
          </Link>
          <Link href={`/admin/calendar?start=${nextStart}`} className="rounded-md border border-ink-900/15 px-3 py-2 text-sm font-medium text-ink-900/70 hover:bg-sand-100">
            Next →
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-900/60">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-sea-500/10" /> Good availability</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-gold-500/15" /> Low availability</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-red-500/15" /> Fully booked</span>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-900/8 bg-white shadow-card">
        <table className="w-full min-w-[1400px] border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-sand-100/90 px-4 py-3 text-left text-xs uppercase tracking-wider text-ink-900/50">
                Room Type
              </th>
              {days.map((d) => (
                <th key={d.toISOString()} className="border-l border-ink-900/5 bg-sand-100/60 px-2 py-3 text-center font-medium text-ink-900/50">
                  <div>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                  <div className="text-ink-900/70">{d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map(({ roomType, blocked, cells }) => (
              <tr key={roomType.id} className="border-t border-ink-900/5">
                <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-ink-900">
                  {roomType.name}
                  <div className="text-[11px] font-normal text-ink-900/40">
                    {roomType.totalRooms} units{blocked > 0 ? ` · ${blocked} in maintenance` : ''}
                  </div>
                </td>
                {cells.map(({ date, available }) => (
                  <td key={date.toISOString()} className={`border-l border-ink-900/5 px-2 py-3 text-center ${cellStyle(available, roomType.totalRooms)}`}>
                    {available}/{roomType.totalRooms}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {roomTypes.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-900/50">Add room types first to see the calendar.</p>
        )}
      </div>
    </div>
  );
}
