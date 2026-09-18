'use client';

import { useTransition } from 'react';
import { markMessageRead, deleteMessage } from '@/app/admin/messages/actions';

export function MessageRowControls({ id, isRead }: { id: string; isRead: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={pending}
        onClick={() => startTransition(() => markMessageRead(id, !isRead))}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          isRead ? 'bg-ink-900/10 text-ink-900/50' : 'bg-gold-500/10 text-gold-700'
        }`}
      >
        {isRead ? 'Mark unread' : 'Mark read'}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm('Delete this message?')) startTransition(() => deleteMessage(id));
        }}
        className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600"
      >
        Delete
      </button>
    </div>
  );
}
