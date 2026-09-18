import { db } from '@/server/db';
import { getAvailableRoomCount } from './availability.service';
import { calculateBookingPrice } from './pricing.service';
import { validateCoupon, CouponError } from './coupon.service';
import { generateBookingCode } from '@/lib/utils';
import type { BookingSource } from '@prisma/client';

export class BookingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

interface CreateBookingInput {
  userId?: string;
  roomTypeId: string;
  checkIn: Date;
  checkOut: Date;
  roomsBooked: number;
  guestsCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  couponCode?: string;
  guests?: Array<{ fullName: string; age?: number; idType?: string; idNumber?: string }>;
  source?: BookingSource;
}

/**
 * Creates a booking inside a serializable transaction: availability is
 * re-checked *after* acquiring the transaction so two customers racing for
 * the last room can never both succeed (the second one re-reads a lower
 * available count and is rejected before any row is written).
 */
export async function createBooking(input: CreateBookingInput) {
  const roomType = await db.roomType.findUnique({ where: { id: input.roomTypeId } });
  if (!roomType || !roomType.isActive) throw new BookingError('Room type not found', 404);

  if (input.guestsCount > roomType.maxGuests * input.roomsBooked) {
    throw new BookingError(
      `This room type allows up to ${roomType.maxGuests} guests per room`,
    );
  }

  let discount: { type: 'PERCENTAGE' | 'FIXED'; value: number } | undefined;
  let couponId: string | undefined;

  const priceEstimate = await calculateBookingPrice(
    input.roomTypeId,
    input.checkIn,
    input.checkOut,
    input.roomsBooked,
  );

  if (input.couponCode) {
    try {
      const coupon = await validateCoupon(input.couponCode, priceEstimate.subtotal);
      discount = { type: coupon.discountType, value: Number(coupon.discountValue) };
      couponId = coupon.id;
    } catch (err) {
      if (err instanceof CouponError) throw new BookingError(err.message);
      throw err;
    }
  }

  const price = await calculateBookingPrice(
    input.roomTypeId,
    input.checkIn,
    input.checkOut,
    input.roomsBooked,
    discount,
  );

  const booking = await db.$transaction(
    async (tx) => {
      const available = await getAvailableRoomCount(
        input.roomTypeId,
        input.checkIn,
        input.checkOut,
        tx,
      );

      if (available < input.roomsBooked) {
        throw new BookingError(
          `Only ${available} room(s) of this type are available for the selected dates`,
          409,
        );
      }

      const sequence = (await tx.booking.count()) + 1;

      const created = await tx.booking.create({
        data: {
          bookingCode: generateBookingCode(sequence),
          userId: input.userId,
          roomTypeId: input.roomTypeId,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          roomsBooked: input.roomsBooked,
          guestsCount: input.guestsCount,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          specialRequests: input.specialRequests,
          basePrice: price.averageNightlyRate,
          nights: price.nights,
          subtotal: price.subtotal,
          taxAmount: price.taxAmount,
          discountAmount: price.discountAmount,
          totalAmount: price.totalAmount,
          couponId,
          status: input.source === 'WEBSITE' || !input.source ? 'PENDING' : 'CONFIRMED',
          source: input.source ?? 'WEBSITE',
          guests: input.guests?.length
            ? { createMany: { data: input.guests } }
            : undefined,
        },
      });

      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usageCount: { increment: 1 } } });
      }

      return created;
    },
    { isolationLevel: 'Serializable' },
  );

  return booking;
}
