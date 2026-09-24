import { db } from '@/server/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { createPricingRule } from './actions';
import { PricingRuleRow } from '@/components/admin/pricing-rule-row';

export default async function AdminPricingPage() {
  const [roomTypes, rules] = await Promise.all([
    db.roomType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    db.pricingRule.findMany({
      orderBy: [{ type: 'desc' }, { startDate: 'asc' }],
      include: { roomType: { select: { name: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink-900">Pricing Management</h1>
      <p className="mt-1 text-sm text-ink-900/50">
        Rules resolve in priority order — Holiday beats Seasonal beats Weekend beats the room&apos;s
        base price — and apply per night, so a stay spanning into a holiday correctly blends rates.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-ink-900/8 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-900/8 bg-sand-100/60 text-xs uppercase tracking-wider text-ink-900/50">
            <tr>
              <th className="px-4 py-3 text-left">Room Type</th>
              <th className="px-4 py-3 text-left">Rule</th>
              <th className="px-4 py-3 text-left">Dates</th>
              <th className="px-4 py-3 text-left">Adjustment</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-b border-ink-900/5 last:border-0">
                <td className="px-4 py-4 text-ink-900/70">{r.roomType?.name ?? 'All room types'}</td>
                <td className="px-4 py-4 font-medium text-ink-900">{r.type}</td>
                <td className="px-4 py-4 text-xs text-ink-900/50">
                  {r.startDate && r.endDate ? `${formatDate(r.startDate)} – ${formatDate(r.endDate)}` : '—'}
                </td>
                <td className="px-4 py-4 text-ink-900/70">
                  {r.priceOverride != null
                    ? `Fixed ${formatCurrency(Number(r.priceOverride))}/night`
                    : r.priceDeltaPct != null
                    ? `${Number(r.priceDeltaPct) > 0 ? '+' : ''}${r.priceDeltaPct}%`
                    : '—'}
                </td>
                <td className="px-4 py-4">
                  <PricingRuleRow id={r.id} isActive={r.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rules.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-900/50">No pricing rules yet — add one below.</p>
        )}
      </div>

      <div className="mt-10 rounded-xl border border-ink-900/8 bg-white p-6 shadow-card">
        <h2 className="font-serif text-lg text-ink-900">Add Pricing Rule</h2>
        <form action={createPricingRule} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <select name="roomTypeId" defaultValue="" className="input">
            <option value="">All room types</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>{rt.name}</option>
            ))}
          </select>
          <select name="type" required defaultValue="SEASONAL" className="input">
            <option value="WEEKEND">Weekend (Fri/Sat/Sun)</option>
            <option value="SEASONAL">Seasonal</option>
            <option value="HOLIDAY">Holiday</option>
          </select>
          <input name="startDate" type="date" placeholder="Start date (seasonal/holiday only)" className="input" />
          <input name="endDate" type="date" placeholder="End date (seasonal/holiday only)" className="input" />
          <input name="priceOverride" type="number" placeholder="Fixed price / night (₹) — optional" className="input" />
          <input name="priceDeltaPct" type="number" placeholder="OR % adjustment, e.g. 20 or -10" className="input" />
          <button type="submit" className="btn-gold sm:col-span-2">Add Rule</button>
        </form>
      </div>
    </div>
  );
}
