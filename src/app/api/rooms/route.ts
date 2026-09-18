import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  const roomTypes = await db.roomType.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { order: 'asc' } },
    },
    orderBy: { basePrice: 'asc' },
  });

  return NextResponse.json({ roomTypes });
}
