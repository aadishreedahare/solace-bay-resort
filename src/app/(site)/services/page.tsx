import type { Metadata } from 'next';
import { db } from '@/server/db';
import { PlaceholderImage } from '@/components/site/placeholder-image';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dining & Spa Services' };
export const revalidate = 60;

export default async function ServicesPage() {
  const services = await db.service.findMany({
    where: { isAvailable: true },
    orderBy: { order: 'asc' },
  }).catch(() => []);

  return (
    <div className="py-16">
      <div className="container-site">
        <h1 className="font-serif text-3xl text-ink-900 sm:text-4xl">Dining &amp; Services</h1>
        <p className="mt-3 max-w-lg text-sm text-ink-900/60">
          Restaurant, spa, airport pickup, and more — arranged directly through the front desk or ahead of arrival.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <div key={s.id} className="overflow-hidden rounded-xl border border-ink-900/8 bg-white shadow-card">
              <PlaceholderImage seed={i} src={`/images/service-${i + 1}.jpg`} className="h-44 w-full" />
              <div className="p-6">
                <h3 className="font-serif text-lg text-ink-900">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-900/60">{s.description}</p>
                <p className="mt-4 text-sm font-semibold text-gold-600">
                  {s.price != null ? formatCurrency(Number(s.price)) : 'On request'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <p className="mt-10 text-sm text-ink-900/50">Services will appear here once added from the admin panel.</p>
        )}
      </div>
    </div>
  );
}
