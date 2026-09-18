import { db } from '@/server/db';
import { formatDate } from '@/lib/utils';
import { MessageRowControls } from '@/components/admin/message-row-controls';

export default async function AdminMessagesPage() {
  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink-900">Contact Messages</h1>
      <p className="mt-1 text-sm text-ink-900/50">
        Submissions from the public Contact page. {unreadCount} unread.
      </p>

      <div className="mt-8 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl border p-5 shadow-card ${
              m.isRead ? 'border-ink-900/8 bg-white' : 'border-gold-500/30 bg-gold-500/5'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium text-ink-900">{m.subject}</div>
                <div className="mt-0.5 text-xs text-ink-900/50">
                  {m.name} · {m.email}{m.phone ? ` · ${m.phone}` : ''} · {formatDate(m.createdAt)}
                </div>
              </div>
              <MessageRowControls id={m.id} isRead={m.isRead} />
            </div>
            <p className="mt-3 text-sm text-ink-900/70">{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="rounded-xl border border-ink-900/8 bg-white p-6 text-center text-sm text-ink-900/50 shadow-card">
            No messages yet.
          </p>
        )}
      </div>
    </div>
  );
}
