'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions, assertRole } from '@/server/auth';
import { db } from '@/server/db';

export async function markMessageRead(id: string, isRead: boolean) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN', 'STAFF']);

  await db.contactMessage.update({ where: { id }, data: { isRead } });
  revalidatePath('/admin/messages');
}

export async function deleteMessage(id: string) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN']);

  await db.contactMessage.delete({ where: { id } });
  revalidatePath('/admin/messages');
}
