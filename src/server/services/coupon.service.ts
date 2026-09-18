import { db } from '@/server/db';

export class CouponError extends Error {}

export async function validateCoupon(code: string, bookingAmount: number) {
  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!coupon || !coupon.isActive) throw new CouponError('Invalid or inactive coupon code');

  const now = new Date();
  if (now < coupon.startDate || now > coupon.expiryDate) {
    throw new CouponError('This coupon is not currently valid');
  }
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    throw new CouponError('This coupon has reached its usage limit');
  }
  if (coupon.minBookingAmount != null && bookingAmount < Number(coupon.minBookingAmount)) {
    throw new CouponError(
      `This coupon requires a minimum booking amount of ₹${coupon.minBookingAmount}`,
    );
  }

  return coupon;
}
