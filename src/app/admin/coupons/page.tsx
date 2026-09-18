import { db } from '@/server/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { createCoupon } from './actions';
import { CouponRowControls } from '@/components/admin/coupon-row-controls';

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { startDate: 'desc' } });

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink-900">Offers &amp; Coupons</h1>
      <p className="mt-1 text-sm text-ink-900/50">
        Active, in-date coupons also appear automatically on the public Offers page.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-ink-900/8 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-900/8 bg-sand-100/60 text-xs uppercase tracking-wider text-ink-900/50">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Valid</th>
              <th className="px-4 py-3 text-left">Usage</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-ink-900/5 last:border-0">
                <td className="px-4 py-4 font-mono font-medium text-ink-900">{c.code}</td>
                <td className="px-4 py-4 text-ink-900/70">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatCurrency(Number(c.discountValue))}
                  {c.minBookingAmount && (
                    <div className="text-xs text-ink-900/40">min. {formatCurrency(Number(c.minBookingAmount))}</div>
                  )}
                </td>
                <td className="px-4 py-4 text-xs text-ink-900/50">
                  {formatDate(c.startDate)} – {formatDate(c.expiryDate)}
                </td>
                <td className="px-4 py-4 text-ink-900/70">
                  {c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}
                </td>
                <td className="px-4 py-4">
                  <CouponRowControls id={c.id} isActive={c.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-900/50">No coupons yet — add one below.</p>
        )}
      </div>

      <div className="mt-10 rounded-xl border border-ink-900/8 bg-white p-6 shadow-card">
        <h2 className="font-serif text-lg text-ink-900">Add Coupon</h2>
        <form action={createCoupon} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input name="code" required placeholder="Code, e.g. COASTAL20" className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm uppercase" />
          <select name="discountType" required defaultValue="PERCENTAGE" className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm">
            <option value="PERCENTAGE">Percentage off</option>
            <option value="FIXED">Fixed amount off (₹)</option>
          </select>
          <input name="discountValue" required type="number" placeholder="Discount value" className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm" />
          <input name="minBookingAmount" type="number" placeholder="Min. booking amount (optional)" className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm" />
          <label className="flex flex-col gap-1 text-xs text-ink-900/50">
            Start date
            <input name="startDate" type="date" required className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm text-ink-900" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-900/50">
            Expiry date
            <input name="expiryDate" type="date" required className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm text-ink-900" />
          </label>
          <input name="usageLimit" type="number" placeholder="Total usage limit (optional)" className="sm:col-span-2 rounded-md border border-ink-900/15 px-3 py-2.5 text-sm" />
          <button type="submit" className="btn-gold sm:col-span-2">Add Coupon</button>
        </form>
      </div>
    </div>
  );
}
