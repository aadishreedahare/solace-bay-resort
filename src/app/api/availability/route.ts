import { NextResponse } from 'next/server';
import { availabilityQuerySchema } from '@/lib/validation';
import { getAvailabilityForAllRoomTypes, getAvailableRoomCount } from '@/server/services/availability.service';
import { calculateBookingPrice } from '@/server/services/pricing.service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = availabilityQuerySchema.safeParse({
    checkIn: searchParams.get('checkIn'),
    checkOut: searchParams.get('checkOut'),
    guests: searchParams.get('guests') ?? undefined,
    roomTypeId: searchParams.get('roomTypeId') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query', issues: parsed.error.flatten() }, { status: 400 });
  }

  const { checkIn, checkOut, guests, roomTypeId } = parsed.data;

  if (roomTypeId) {
    const [availableRooms, price] = await Promise.all([
      getAvailableRoomCount(roomTypeId, checkIn, checkOut),
      calculateBookingPrice(roomTypeId, checkIn, checkOut, 1),
    ]);
    return NextResponse.json({ roomTypeId, availableRooms, price });
  }

  const results = await getAvailabilityForAllRoomTypes(checkIn, checkOut, guests);
  return NextResponse.json({ results });
}
