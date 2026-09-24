'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/server/auth';
import { db } from '@/server/db';

export async function markMessageRead(id: string, isRead: boolean) {
  await requireRole(['ADMIN', 'STAFF']);
  await db.contactMessage.update({ where: { id }, data: { isRead } });
  revalidatePath('/admin/messages');
}

export async function deleteMessage(id: string) {
  await requireRole(['ADMIN']);
  await db.contactMessage.delete({ where: { id } });
  revalidatePath('/admin/messages');
}
