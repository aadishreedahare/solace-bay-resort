import type { Metadata } from 'next';
import { db } from '@/server/db';
import { getAvailableRoomCount } from '@/server/services/availability.service';
import { RoomCard, toRoomCard } from '@/components/site/room-card';
import { SectionHeading } from '@/components/site/section-heading';
import { PlaceholderImage } from '@/components/site/placeholder-image';

export const metadata: Metadata = {
  title: 'Rooms & Suites',
  description:
    'Browse Deluxe Rooms, Premium Rooms, Executive Rooms, Suites, and Family Rooms at Solace Bay Resort & Spa, Alibaug — real-time availability, no hidden fees.',
};

export const revalidate = 30;

function parseDate(value: string | undefined, fallbackOffsetDays: number) {
  if (value) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const d = new Date();
  d.setDate(d.getDate() + fallbackOffsetDays);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: { checkIn?: string; checkOut?: string; guests?: string };
}) {
  const checkIn = parseDate(searchParams.checkIn, 0);
  const checkOut = parseDate(searchParams.checkOut, 1);
  const guests = Number(searchParams.guests) || 1;

  const roomTypes = await db.roomType.findMany({
    where: { isActive: true, maxGuests: { gte: guests } },
    orderBy: { basePrice: 'asc' },
  });

  const rooms = await Promise.all(
    roomTypes.map(async (rt, i) => ({
      ...toRoomCard(rt, i),
      availableRooms: await getAvailableRoomCount(rt.id, checkIn, checkOut).catch(() => rt.totalRooms),
    })),
  );

  return (
    <>
      <section className="relative flex h-72 items-center justify-center overflow-hidden">
        <PlaceholderImage seed={2} src="/images/rooms-hero.jpg" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-ink-950/55" />
        <div className="container-site relative z-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Accommodation</p>
          <h1 className="mt-4 font-serif text-4xl text-white sm:text-5xl">Rooms &amp; Suites</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="container-site">
          <SectionHeading
            eyebrow="Availability"
            title={`${rooms.length} Room Type${rooms.length === 1 ? '' : 's'} Available`}
            description={`Showing rates for ${checkIn.toLocaleDateString('en-IN')} – ${checkOut.toLocaleDateString('en-IN')}, ${guests} guest${guests > 1 ? 's' : ''}.`}
          />

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div key={room.slug} className="relative">
                <RoomCard room={room} />
                {room.availableRooms <= 3 && room.availableRooms > 0 && (
                  <span className="absolute right-4 top-4 rounded-full bg-ink-900/90 px-3 py-1 text-[11px] font-semibold text-white">
                    Only {room.availableRooms} left
                  </span>
                )}
                {room.availableRooms === 0 && (
                  <span className="absolute right-4 top-4 rounded-full bg-red-600/90 px-3 py-1 text-[11px] font-semibold text-white">
                    Fully booked
                  </span>
                )}
              </div>
            ))}
          </div>

          {rooms.length === 0 && (
            <p className="mt-10 text-center text-sm text-ink-900/60">
              No rooms match this guest count for the selected dates — try adjusting your search.
            </p>
          )}
        </div>
      </section>
    </>
  );
}