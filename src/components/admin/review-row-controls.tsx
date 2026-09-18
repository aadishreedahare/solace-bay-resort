'use client';

import { useTransition } from 'react';
import { approveReview, hideReview, deleteReview } from '@/app/admin/reviews/actions';

export function ReviewRowControls({
  id,
  isApproved,
  isHidden,
}: {
  id: string;
  isApproved: boolean;
  isHidden: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isApproved && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => approveReview(id))}
          className="rounded-full bg-sea-500/10 px-3 py-1 text-xs font-semibold text-sea-600 disabled:opacity-40"
        >
          Approve
        </button>
      )}
      {!isHidden && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => hideReview(id))}
          className="rounded-full bg-ink-900/10 px-3 py-1 text-xs font-semibold text-ink-900/60 disabled:opacity-40"
        >
          Hide
        </button>
      )}
      <button
        disabled={pending}
        onClick={() => {
          if (confirm('Permanently delete this review?')) startTransition(() => deleteReview(id));
        }}
        className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 disabled:opacity-40"
      >
        Delete
      </button>
    </div>
  );
}
