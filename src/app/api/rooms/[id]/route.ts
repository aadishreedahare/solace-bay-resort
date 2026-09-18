import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const roomType = await db.roomType.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }], isActive: true },
    include: {
      images: { orderBy: { order: 'asc' } },
      reviews: {
        where: { isApproved: true, isHidden: false },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!roomType) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  return NextResponse.json({ roomType });
}
