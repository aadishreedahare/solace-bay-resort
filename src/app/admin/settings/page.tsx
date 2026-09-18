import { db } from '@/server/db';
import { updateHotelSettings } from './actions';

const inputClass = 'rounded-md border border-ink-900/15 px-3 py-2.5 text-sm';
const labelClass = 'flex flex-col gap-1 text-xs font-medium text-ink-900/50';

export default async function AdminSettingsPage() {
  const hotel = await db.hotel.findFirstOrThrow();

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink-900">Hotel Settings</h1>
      <p className="mt-1 text-sm text-ink-900/50">
        Everything here drives the public site directly — name, contact details, policies. No code
        changes are ever needed to update the hotel&apos;s content.
      </p>

      <form action={updateHotelSettings} className="mt-8 space-y-8">
        <section className="rounded-xl border border-ink-900/8 bg-white p-6 shadow-card">
          <h2 className="font-serif text-lg text-ink-900">Identity</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Hotel Name
              <input name="name" required defaultValue={hotel.name} className={inputClass} />
            </label>
            <label className={labelClass}>
              Tagline
              <input name="tagline" required defaultValue={hotel.tagline} className={inputClass} />
            </label>
            <label className={`sm:col-span-2 ${labelClass}`}>
              Description
              <textarea name="description" required rows={4} defaultValue={hotel.description} className={inputClass} />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-ink-900/8 bg-white p-6 shadow-card">
          <h2 className="font-serif text-lg text-ink-900">Location &amp; Contact</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={`sm:col-span-2 ${labelClass}`}>
              Address
              <input name="address" required defaultValue={hotel.address} className={inputClass} />
            </label>
            <label className={labelClass}>
              City
              <input name="city" required defaultValue={hotel.city} className={inputClass} />
            </label>
            <label className={labelClass}>
              State
              <input name="state" required defaultValue={hotel.state} className={inputClass} />
            </label>
            <label className={labelClass}>
              Country
              <input name="country" required defaultValue={hotel.country} className={inputClass} />
            </label>
            <label className={labelClass}>
              Postal Code
              <input name="postalCode" required defaultValue={hotel.postalCode} className={inputClass} />
            </label>
            <label className={labelClass}>
              Phone
              <input name="phone" required defaultValue={hotel.phone} className={inputClass} />
            </label>
            <label className={labelClass}>
              Email
              <input name="email" type="email" required defaultValue={hotel.email} className={inputClass} />
            </label>
            <label className={`sm:col-span-2 ${labelClass}`}>
              Google Maps Embed URL (optional)
              <input name="mapEmbedUrl" defaultValue={hotel.mapEmbedUrl ?? ''} className={inputClass} />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-ink-900/8 bg-white p-6 shadow-card">
          <h2 className="font-serif text-lg text-ink-900">Policies</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className={labelClass}>
              Check-in Time
              <input name="checkInTime" required defaultValue={hotel.checkInTime} placeholder="14:00" className={inputClass} />
            </label>
            <label className={labelClass}>
              Check-out Time
              <input name="checkOutTime" required defaultValue={hotel.checkOutTime} placeholder="11:00" className={inputClass} />
            </label>
            <label className={labelClass}>
              Tax (%)
              <input name="taxPercent" type="number" step="0.01" required defaultValue={Number(hotel.taxPercent)} className={inputClass} />
            </label>
            <label className={labelClass}>
              Free cancellation window (hours before check-in)
              <input name="cancellationHoursThreshold" type="number" required defaultValue={hotel.cancellationHoursThreshold} className={inputClass} />
            </label>
            <label className={labelClass}>
              Refund % if cancelled before window
              <input name="cancellationFullRefundPct" type="number" required defaultValue={hotel.cancellationFullRefundPct} className={inputClass} />
            </label>
            <label className={labelClass}>
              Refund % if cancelled after window
              <input name="cancellationLateRefundPct" type="number" required defaultValue={hotel.cancellationLateRefundPct} className={inputClass} />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-ink-900/8 bg-white p-6 shadow-card">
          <h2 className="font-serif text-lg text-ink-900">Social Links</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className={labelClass}>
              Facebook
              <input name="facebookUrl" defaultValue={hotel.facebookUrl ?? ''} className={inputClass} />
            </label>
            <label className={labelClass}>
              Instagram
              <input name="instagramUrl" defaultValue={hotel.instagramUrl ?? ''} className={inputClass} />
            </label>
            <label className={labelClass}>
              Twitter / X
              <input name="twitterUrl" defaultValue={hotel.twitterUrl ?? ''} className={inputClass} />
            </label>
          </div>
        </section>

        <button type="submit" className="btn-gold">Save Changes</button>
      </form>
    </div>
  );
}
