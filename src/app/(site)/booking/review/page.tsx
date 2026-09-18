import { notFound } from 'next/navigation';
import { db } from '@/server/db';
import { calculateBookingPrice } from '@/server/services/pricing.service';
import { BookingReviewForm } from '@/components/site/booking-review-form';

export default async function BookingReviewPage({
  searchParams,
}: {
  searchParams: { roomTypeId?: string; checkIn?: string; checkOut?: string; rooms?: string; guests?: string };
}) {
  const { roomTypeId, checkIn, checkOut, rooms, guests } = searchParams;
  if (!roomTypeId || !checkIn || !checkOut || !rooms || !guests) notFound();

  const room = await db.roomType.findUnique({ where: { id: roomTypeId } });
  if (!room) notFound();

  const price = await calculateBookingPrice(roomTypeId, new Date(checkIn), new Date(checkOut), Number(rooms));

  return (
    <div className="container-site py-16">
      <p className="eyebrow">Step 1 of 3</p>
      <h1 className="mt-2 font-serif text-3xl text-ink-900">Review &amp; Guest Details</h1>

      <div className="mt-10">
        <BookingReviewForm
          roomTypeId={roomTypeId}
          checkIn={checkIn}
          checkOut={checkOut}
          rooms={Number(rooms)}
          guests={Number(guests)}
          roomName={room.name}
          price={price}
        />
      </div>
    </div>
  );
}
