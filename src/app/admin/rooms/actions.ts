'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions, assertRole } from '@/server/auth';
import { db } from '@/server/db';

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function createRoomType(formData: FormData) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN']);

  const hotel = await db.hotel.findFirstOrThrow();
  const name = String(formData.get('name'));

  await db.roomType.create({
    data: {
      hotelId: hotel.id,
      slug: `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      description: String(formData.get('description')),
      bedType: String(formData.get('bedType')),
      sizeSqft: Number(formData.get('sizeSqft')),
      maxGuests: Number(formData.get('maxGuests')),
      basePrice: Number(formData.get('basePrice')),
      totalRooms: Number(formData.get('totalRooms')),
      amenities: String(formData.get('amenities') || '')
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    },
  });

  revalidatePath('/admin/rooms');
}

export async function setRoomTypeStatus(roomTypeId: string, isActive: boolean) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN']);

  await db.roomType.update({ where: { id: roomTypeId }, data: { isActive } });
  revalidatePath('/admin/rooms');
}

export async function updateRoomTypePrice(roomTypeId: string, basePrice: number) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN']);

  await db.roomType.update({ where: { id: roomTypeId }, data: { basePrice } });
  revalidatePath('/admin/rooms');
}
