'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { field } from '@/lib/form';

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function createRoomType(form: FormData) {
  await requireRole(['ADMIN']);
  const hotel = await db.hotel.findFirstOrThrow();
  const name = field(form, 'name');

  await db.roomType.create({
    data: {
      hotelId: hotel.id,
      slug: `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      description: field(form, 'description'),
      bedType: field(form, 'bedType'),
      sizeSqft: Number(field(form, 'sizeSqft')),
      maxGuests: Number(field(form, 'maxGuests')),
      basePrice: Number(field(form, 'basePrice')),
      totalRooms: Number(field(form, 'totalRooms')),
      amenities: field(form, 'amenities').split(',').map((a) => a.trim()).filter(Boolean),
    },
  });
  revalidatePath('/admin/rooms');
}

export async function setRoomTypeStatus(roomTypeId: string, isActive: boolean) {
  await requireRole(['ADMIN']);
  await db.roomType.update({ where: { id: roomTypeId }, data: { isActive } });
  revalidatePath('/admin/rooms');
}

export async function updateRoomTypePrice(roomTypeId: string, basePrice: number) {
  await requireRole(['ADMIN']);
  await db.roomType.update({ where: { id: roomTypeId }, data: { basePrice } });
  revalidatePath('/admin/rooms');
}
