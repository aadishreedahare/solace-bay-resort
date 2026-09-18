import { NextResponse } from 'next/server';
import { couponValidateSchema } from '@/lib/validation';
import { validateCoupon, CouponError } from '@/server/services/coupon.service';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = couponValidateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  try {
    const coupon = await validateCoupon(parsed.data.code, parsed.data.bookingAmount);
    return NextResponse.json({
      valid: true,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
    });
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json({ valid: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json({ valid: false, error: 'Could not validate coupon' }, { status: 500 });
  }
}
