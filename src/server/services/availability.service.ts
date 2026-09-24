import type { Prisma } from '@prisma/client';
import { db } from '@/server/db';

type Client = Prisma.TransactionClient | typeof db;

// Availability is always calculated live, never stored:
//   free rooms = total rooms - rooms in overlapping active bookings - rooms under maintenance
// Two stays overlap when existing.checkIn < new.checkOut AND existing.checkOut > new.checkIn,
// so checking out and checking in on the same day is not a clash.
export async function getAvailableRoomCount(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  tx: Client = db,
) {
  const [roomType, booked, blocked] = await Promise.all([
    tx.roomType.findUniqueOrThrow({ where: { id: roomTypeId }, select: { totalRooms: true } }),
    tx.booking.aggregate({
      where: {
        roomTypeId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      _sum: { roomsBooked: true },
    }),
    getBlockedRoomCount(roomTypeId, tx),
  ]);

  return Math.max(0, roomType.totalRooms - (booked._sum.roomsBooked ?? 0) - blocked);
}

function getBlockedRoomCount(roomTypeId: string, tx: Client = db) {
  return tx.room.count({ where: { roomTypeId, status: { in: ['MAINTENANCE', 'UNAVAILABLE'] } } });
}

export async function getAvailabilityForAllRoomTypes(checkIn: Date, checkOut: Date, minGuests = 1) {
  const roomTypes = await db.roomType.findMany({
    where: { isActive: true, maxGuests: { gte: minGuests } },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
  });

  return Promise.all(
    roomTypes.map(async (roomType) => ({
      roomType,
      availableRooms: await getAvailableRoomCount(roomType.id, checkIn, checkOut),
    })),
  );
}
