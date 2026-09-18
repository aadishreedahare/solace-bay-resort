import { db } from '@/server/db';
import { formatDate } from '@/lib/utils';
import { StarRating } from '@/components/site/star-rating';
import { ReviewRowControls } from '@/components/admin/review-row-controls';

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: [{ isApproved: 'asc' }, { createdAt: 'desc' }],
    include: { user: { select: { name: true } }, roomType: { select: { name: true } } },
  });

  const pending = reviews.filter((r) => !r.isApproved);
  const published = reviews.filter((r) => r.isApproved);

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink-900">Reviews</h1>
      <p className="mt-1 text-sm text-ink-900/50">
        Guest reviews only appear on the site after approval. {pending.length} awaiting review.
      </p>

      <div className="mt-8 space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-ink-900/8 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink-900">{r.user.name}</span>
                  <span className="text-xs text-ink-900/40">· {r.roomType.name}</span>
                  <span className="text-xs text-ink-900/40">· {formatDate(r.createdAt)}</span>
                </div>
                <div className="mt-1"><StarRating rating={r.rating} /></div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  r.isHidden
                    ? 'bg-ink-900/10 text-ink-900/50'
                    : r.isApproved
                    ? 'bg-sea-500/10 text-sea-600'
                    : 'bg-gold-500/10 text-gold-700'
                }`}
              >
                {r.isHidden ? 'Hidden' : r.isApproved ? 'Published' : 'Pending'}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-900/70">{r.text}</p>
            <div className="mt-4">
              <ReviewRowControls id={r.id} isApproved={r.isApproved} isHidden={r.isHidden} />
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="rounded-xl border border-ink-900/8 bg-white p-6 text-center text-sm text-ink-900/50 shadow-card">
            No reviews submitted yet.
          </p>
        )}
      </div>
    </div>
  );
}
