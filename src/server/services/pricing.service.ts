import { db } from '@/server/db';
import { nightsBetween } from '@/lib/utils';

/**
 * Resolves the nightly rate for a room type on a specific date, applying
 * (in priority order) HOLIDAY > SEASONAL > WEEKEND > BASE pricing rules.
 * Admin manages all of these from /admin/pricing — nothing is hardcoded.
 */
export async function getNightlyRate(roomTypeId: string, date: Date): Promise<number> {
  const roomType = await db.roomType.findUniqueOrThrow({
    where: { id: roomTypeId },
    select: { basePrice: true },
  });

  const rules = await db.pricingRule.findMany({
    where: {
      roomTypeId,
      isActive: true,
      OR: [
        { type: 'BASE' },
        { type: 'WEEKEND' },
        {
          type: { in: ['SEASONAL', 'HOLIDAY'] },
          startDate: { lte: date },
          endDate: { gte: date },
        },
      ],
    },
  });

  const priority: Record<string, number> = { HOLIDAY: 3, SEASONAL: 2, WEEKEND: 1, BASE: 0 };
  const isWeekend = [0, 6].includes(date.getDay());

  const applicable = rules
    .filter((r) => r.type !== 'WEEKEND' || isWeekend)
    .sort((a, b) => priority[b.type] - priority[a.type]);

  const base = Number(roomType.basePrice);
  const rule = applicable[0];
  if (!rule) return base;

  if (rule.priceOverride != null) return Number(rule.priceOverride);
  if (rule.priceDeltaPct != null) return base * (1 + Number(rule.priceDeltaPct) / 100);
  return base;
}

/** Sums the nightly rate across every night of the stay (handles rate changes mid-stay, e.g. a holiday). */
export async function getStaySubtotalPerRoom(roomTypeId: string, checkIn: Date, checkOut: Date) {
  const nights = nightsBetween(checkIn, checkOut);
  let total = 0;
  const cursor = new Date(checkIn);

  for (let i = 0; i < nights; i++) {
    total += await getNightlyRate(roomTypeId, cursor);
    cursor.setDate(cursor.getDate() + 1);
  }

  return { nights, subtotalPerRoom: total, averageNightlyRate: total / nights };
}

export interface PriceBreakdown {
  nights: number;
  averageNightlyRate: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export async function calculateBookingPrice(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  roomsBooked: number,
  discount?: { type: 'PERCENTAGE' | 'FIXED'; value: number },
): Promise<PriceBreakdown> {
  const hotel = await db.hotel.findFirstOrThrow();
  const { nights, subtotalPerRoom, averageNightlyRate } = await getStaySubtotalPerRoom(
    roomTypeId,
    checkIn,
    checkOut,
  );

  const subtotal = subtotalPerRoom * roomsBooked;
  const taxAmount = subtotal * (Number(hotel.taxPercent) / 100);

  let discountAmount = 0;
  if (discount) {
    discountAmount =
      discount.type === 'PERCENTAGE' ? subtotal * (discount.value / 100) : discount.value;
    discountAmount = Math.min(discountAmount, subtotal); // never discount past zero
  }

  const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

  return {
    nights,
    averageNightlyRate: Math.round(averageNightlyRate),
    subtotal: Math.round(subtotal),
    taxAmount: Math.round(taxAmount),
    discountAmount: Math.round(discountAmount),
    totalAmount: Math.round(totalAmount),
  };
}
