import type { Metadata } from 'next';
import { db } from '@/server/db';
import { formatDate } from '@/lib/utils';
import { Tag } from 'lucide-react';

export const metadata: Metadata = { title: 'Offers & Packages' };
export const revalidate = 60;

export default async function OffersPage() {
  const now = new Date();
  const coupons = await db.coupon.findMany({
    where: { isActive: true, expiryDate: { gte: now } },
    orderBy: { expiryDate: 'asc' },
  }).catch(() => []);

  return (
    <div className="py-16">
      <div className="container-site">
        <h1 className="font-serif text-3xl text-ink-900 sm:text-4xl">Offers &amp; Packages</h1>
        <p className="mt-3 max-w-lg text-sm text-ink-900/60">
          Our best rates are always here, on the direct website — never on third-party platforms.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {coupons.map((c) => (
            <div key={c.id} className="flex items-start gap-4 rounded-xl border border-gold-500/25 bg-gold-500/5 p-6">
              <Tag className="mt-1 h-5 w-5 shrink-0 text-gold-500" />
              <div>
                <p className="font-serif text-lg text-ink-900">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                </p>
                <p className="mt-1 text-sm text-ink-900/60">
                  Use code <span className="font-mono font-semibold text-ink-900">{c.code}</span> at checkout
                </p>
                <p className="mt-1 text-xs text-ink-900/45">Valid until {formatDate(c.expiryDate)}</p>
              </div>
            </div>
          ))}
        </div>

        {coupons.length === 0 && (
          <p className="mt-10 text-sm text-ink-900/50">No active offers right now — check back soon.</p>
        )}
      </div>
    </div>
  );
}
