import { db } from '@/server/db';
import type { Prisma } from '@prisma/client';

/**
 * Availability is NEVER stored as a static counter. It is computed on every
 * request as:
 *
 *   available = totalRooms
 *              - rooms held by overlapping PENDING/CONFIRMED bookings
 *              - individual physical rooms currently in MAINTENANCE/UNAVAILABLE
 *
 * Two bookings overlap iff:  existing.checkIn < newCheckOut AND existing.checkOut > newCheckIn
 * (the classic half-open interval overlap test — same-day checkout/checkin does NOT overlap).
 */

export async function getOverlappingBookedRooms(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  tx: Prisma.TransactionClient | typeof db = db,
  excludeBookingId?: string,
): Promise<number> {
  const overlapping = await tx.booking.aggregate({
    where: {
      roomTypeId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    _sum: { roomsBooked: true },
  });

  return overlapping._sum.roomsBooked ?? 0;
}

export async function getBlockedPhysicalRooms(
  roomTypeId: string,
  tx: Prisma.TransactionClient | typeof db = db,
): Promise<number> {
  return tx.room.count({
    where: {
      roomTypeId,
      status: { in: ['MAINTENANCE', 'UNAVAILABLE'] },
    },
  });
}

export async function getAvailableRoomCount(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  tx: Prisma.TransactionClient | typeof db = db,
): Promise<number> {
  const roomType = await tx.roomType.findUniqueOrThrow({
    where: { id: roomTypeId },
    select: { totalRooms: true },
  });

  const [booked, blocked] = await Promise.all([
    getOverlappingBookedRooms(roomTypeId, checkIn, checkOut, tx),
    getBlockedPhysicalRooms(roomTypeId, tx),
  ]);

  return Math.max(0, roomType.totalRooms - booked - blocked);
}

/** Returns availability for every active room type for a given date range — powers the homepage/rooms search. */
export async function getAvailabilityForAllRoomTypes(
  checkIn: Date,
  checkOut: Date,
  minGuests = 1,
) {
  const roomTypes = await db.roomType.findMany({
    where: { isActive: true, maxGuests: { gte: minGuests } },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
  });

  const results = await Promise.all(
    roomTypes.map(async (rt) => ({
      roomType: rt,
      availableRooms: await getAvailableRoomCount(rt.id, checkIn, checkOut),
    })),
  );

  return results;
}
