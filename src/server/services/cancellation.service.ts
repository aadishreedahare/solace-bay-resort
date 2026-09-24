import { db } from '@/server/db';
import { BookingError } from './booking.service';

// Refund depends on how early the guest cancels (thresholds come from hotel settings).
// Availability is computed live, so marking the booking CANCELLED frees the room immediately.
export async function cancelBooking(bookingId: string, reason?: string) {
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new BookingError('Booking not found', 404);
  if (booking.status === 'CANCELLED') throw new BookingError('Booking is already cancelled');
  if (booking.status === 'COMPLETED') throw new BookingError('Completed stays cannot be cancelled');

  const hotel = await db.hotel.findFirstOrThrow();
  const hoursUntilCheckIn = (booking.checkIn.getTime() - Date.now()) / 3_600_000;
  const refundPct =
    hoursUntilCheckIn >= hotel.cancellationHoursThreshold
      ? hotel.cancellationFullRefundPct
      : hotel.cancellationLateRefundPct;
  const refundAmount = Number(booking.totalAmount) * (refundPct / 100);

  const [updated] = await db.$transaction([
    db.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: reason, refundAmount },
    }),
    db.notification.create({
      data: { bookingId, audience: 'CUSTOMER', type: 'booking_cancelled', payload: { refundAmount, refundPct } },
    }),
    db.notification.create({ data: { bookingId, audience: 'ADMIN', type: 'booking_cancelled' } }),
  ]);

  return { booking: updated, refundAmount, refundPct };
}
