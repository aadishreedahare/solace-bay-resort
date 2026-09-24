import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Users, BedDouble, Maximize, Check } from 'lucide-react';
import { db } from '@/server/db';
import { PlaceholderImage } from '@/components/site/placeholder-image';
import { RoomBookingPanel } from '@/components/site/room-booking-panel';
import { StarRating } from '@/components/site/star-rating';

export const revalidate = 30;

async function getRoom(slug: string) {
  return db.roomType.findFirst({
    where: { slug, isActive: true },
    include: {
      reviews: {
        where: { isApproved: true, isHidden: false },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const room = await getRoom(params.slug);
  if (!room) return {};
  return {
    title: room.name,
    description: room.description.slice(0, 155),
  };
}

export default async function RoomDetailPage({ params }: { params: { slug: string } }) {
  const room = await getRoom(params.slug);
  if (!room) notFound();

  const avgRating =
    room.reviews.length > 0
      ? room.reviews.reduce((sum, r) => sum + r.rating, 0) / room.reviews.length
      : null;

  return (
    <div className="py-16">
      <div className="container-site">
        <div className="grid grid-cols-2 grid-rows-2 gap-3 overflow-hidden rounded-xl sm:h-[460px]">
          <PlaceholderImage
            seed={0}
            src={`/images/rooms/${room.slug}.jpg`}
            label={room.name}
            className="col-span-2 row-span-1 h-64 sm:col-span-1 sm:row-span-2 sm:h-full"
          />
          <PlaceholderImage seed={1} src="/images/gallery-1.jpg" className="h-32 sm:h-full" />
          <PlaceholderImage seed={2} src="/images/gallery-2.jpg" className="h-32 sm:h-full" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="eyebrow">{room.bedType}</p>
            <h1 className="mt-2 font-serif text-3xl text-ink-900 sm:text-4xl">{room.name}</h1>

            {avgRating && (
              <div className="mt-3 flex items-center gap-2">
                <StarRating rating={avgRating} />
                <span className="text-sm text-ink-900/60">{avgRating.toFixed(1)} · {room.reviews.length} reviews</span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-ink-900/8 py-5 text-sm text-ink-900/70">
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-gold-500" /> Up to {room.maxGuests} guests</span>
              <span className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-gold-500" /> {room.bedType}</span>
              <span className="flex items-center gap-2"><Maximize className="h-4 w-4 text-gold-500" /> {room.sizeSqft} sq.ft</span>
            </div>

            <p className="mt-6 text-[15px] leading-relaxed text-ink-900/70">{room.description}</p>

            <h3 className="mt-10 font-serif text-xl text-ink-900">Room Amenities</h3>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {room.amenities.map((a) => (
                <span key={a} className="flex items-center gap-2 text-sm text-ink-900/70">
                  <Check className="h-4 w-4 text-gold-500" /> {a}
                </span>
              ))}
            </div>

            {room.reviews.length > 0 && (
              <div className="mt-12">
                <h3 className="font-serif text-xl text-ink-900">Guest Reviews</h3>
                <div className="mt-5 space-y-6">
                  {room.reviews.map((r) => (
                    <div key={r.id} className="border-b border-ink-900/8 pb-6">
                      <div className="flex items-center gap-3">
                        <StarRating rating={r.rating} />
                        <span className="text-xs font-semibold text-ink-900/60">{r.user.name}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink-900/70">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <RoomBookingPanel
            roomTypeId={room.id}
            maxGuests={room.maxGuests}
            basePrice={Number(room.basePrice)}
          />
        </div>
      </div>
    </div>
  );
}
