import { db } from '@/server/db';
import { BookingError } from './booking.service';

/**
 * Applies the hotel's configurable cancellation policy:
 *  - more than `cancellationHoursThreshold` hours before check-in → cancellationFullRefundPct
 *  - within that window → cancellationLateRefundPct
 * Cancelling immediately flips status → CANCELLED, which releases the room
 * back into the availability pool (availability is always computed live,
 * see availability.service.ts, so no separate "release inventory" step is needed).
 */
export async function cancelBooking(bookingId: string, reason?: string) {
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new BookingError('Booking not found', 404);
  if (booking.status === 'CANCELLED') throw new BookingError('Booking is already cancelled');
  if (booking.status === 'COMPLETED') throw new BookingError('Completed stays cannot be cancelled');

  const hotel = await db.hotel.findFirstOrThrow();
  const hoursUntilCheckIn = (booking.checkIn.getTime() - Date.now()) / (1000 * 60 * 60);

  const refundPct =
    hoursUntilCheckIn >= hotel.cancellationHoursThreshold
      ? hotel.cancellationFullRefundPct
      : hotel.cancellationLateRefundPct;

  const refundAmount = Number(booking.totalAmount) * (refundPct / 100);

  const updated = await db.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: reason,
      refundAmount,
    },
  });

  await db.notification.create({
    data: {
      bookingId,
      audience: 'CUSTOMER',
      type: 'booking_cancelled',
      payload: { refundAmount, refundPct },
    },
  });
  await db.notification.create({
    data: { bookingId, audience: 'ADMIN', type: 'booking_cancelled' },
  });

  return { booking: updated, refundAmount, refundPct };
}
