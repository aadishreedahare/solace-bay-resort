import type { PricingRule } from '@prisma/client';
import { db } from '@/server/db';
import { nightsBetween } from '@/lib/utils';

export type Discount = { type: 'PERCENTAGE' | 'FIXED'; value: number };

export interface PriceBreakdown {
  nights: number;
  averageNightlyRate: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

// Higher number wins when several rules match the same night.
const PRIORITY = { HOLIDAY: 3, SEASONAL: 2, WEEKEND: 1, BASE: 0 } as const;

function appliesOn(rule: PricingRule, date: Date) {
  if (rule.type === 'WEEKEND') return date.getDay() === 0 || date.getDay() === 6;
  if (rule.type === 'SEASONAL' || rule.type === 'HOLIDAY') {
    return !!rule.startDate && !!rule.endDate && rule.startDate <= date && rule.endDate >= date;
  }
  return true;
}

function nightlyRate(base: number, rules: PricingRule[], date: Date) {
  const rule = rules
    .filter((r) => appliesOn(r, date))
    // highest priority first; a room-specific rule beats an "all rooms" rule of the same type
    .sort((a, b) => PRIORITY[b.type] - PRIORITY[a.type] || Number(!!b.roomTypeId) - Number(!!a.roomTypeId))[0];

  if (rule?.priceOverride != null) return Number(rule.priceOverride);
  if (rule?.priceDeltaPct != null) return base * (1 + Number(rule.priceDeltaPct) / 100);
  return base;
}

// Prices every night separately, so a stay that runs into a holiday gets the holiday rate for those nights.
export async function calculateBookingPrice(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  roomsBooked: number,
  discount?: Discount,
): Promise<PriceBreakdown> {
  const [hotel, roomType, rules] = await Promise.all([
    db.hotel.findFirstOrThrow(),
    db.roomType.findUniqueOrThrow({ where: { id: roomTypeId }, select: { basePrice: true } }),
    db.pricingRule.findMany({
      where: { isActive: true, OR: [{ roomTypeId }, { roomTypeId: null }] },
    }),
  ]);

  const base = Number(roomType.basePrice);
  const nights = nightsBetween(checkIn, checkOut);
  const date = new Date(checkIn);
  let perRoom = 0;
  for (let i = 0; i < nights; i++) {
    perRoom += nightlyRate(base, rules, date);
    date.setDate(date.getDate() + 1);
  }

  const subtotal = perRoom * roomsBooked;
  const taxAmount = subtotal * (Number(hotel.taxPercent) / 100);
  const discountAmount = discount
    ? Math.min(subtotal, discount.type === 'PERCENTAGE' ? subtotal * (discount.value / 100) : discount.value)
    : 0;

  return {
    nights,
    averageNightlyRate: Math.round(perRoom / nights),
    subtotal: Math.round(subtotal),
    taxAmount: Math.round(taxAmount),
    discountAmount: Math.round(discountAmount),
    totalAmount: Math.round(Math.max(0, subtotal + taxAmount - discountAmount)),
  };
}
