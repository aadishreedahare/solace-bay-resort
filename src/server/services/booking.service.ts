import type { BookingSource } from '@prisma/client';
import { db } from '@/server/db';
import { generateBookingCode } from '@/lib/utils';
import { getAvailableRoomCount } from './availability.service';
import { calculateBookingPrice, type Discount } from './pricing.service';
import { validateCoupon, CouponError } from './coupon.service';

export class BookingError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
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
  guests?: { fullName: string; age?: number; idType?: string; idNumber?: string }[];
  source?: BookingSource;
}

async function getDiscount(code: string | undefined, subtotal: number) {
  if (!code) return {};
  try {
    const coupon = await validateCoupon(code, subtotal);
    const discount: Discount = { type: coupon.discountType, value: Number(coupon.discountValue) };
    return { discount, couponId: coupon.id };
  } catch (err) {
    if (err instanceof CouponError) throw new BookingError(err.message);
    throw err;
  }
}

export async function createBooking({ couponCode, guests, source = 'WEBSITE', ...input }: CreateBookingInput) {
  const roomType = await db.roomType.findUnique({ where: { id: input.roomTypeId } });
  if (!roomType?.isActive) throw new BookingError('Room type not found', 404);

  if (input.guestsCount > roomType.maxGuests * input.roomsBooked) {
    throw new BookingError(`This room type allows up to ${roomType.maxGuests} guests per room`);
  }

  const priceArgs = [input.roomTypeId, input.checkIn, input.checkOut, input.roomsBooked] as const;
  let price = await calculateBookingPrice(...priceArgs);
  const { discount, couponId } = await getDiscount(couponCode, price.subtotal);
  if (discount) price = await calculateBookingPrice(...priceArgs, discount);

  // Serializable transaction: availability is re-checked inside it, so two people
  // racing for the last room can't both get it.
  return db.$transaction(
    async (tx) => {
      const available = await getAvailableRoomCount(input.roomTypeId, input.checkIn, input.checkOut, tx);
      if (available < input.roomsBooked) {
        throw new BookingError(`Only ${available} room(s) of this type are available for the selected dates`, 409);
      }

      const booking = await tx.booking.create({
        data: {
          ...input,
          bookingCode: generateBookingCode((await tx.booking.count()) + 1),
          basePrice: price.averageNightlyRate,
          nights: price.nights,
          subtotal: price.subtotal,
          taxAmount: price.taxAmount,
          discountAmount: price.discountAmount,
          totalAmount: price.totalAmount,
          couponId,
          source,
          status: source === 'WEBSITE' ? 'PENDING' : 'CONFIRMED',
          guests: guests?.length ? { createMany: { data: guests } } : undefined,
        },
      });

      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usageCount: { increment: 1 } } });
      }
      return booking;
    },
    { isolationLevel: 'Serializable' },
  );
}
