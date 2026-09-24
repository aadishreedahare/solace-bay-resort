import { db } from '@/server/db';
import { createRoomType } from './actions';
import { RoomRowControls } from '@/components/admin/room-row-controls';

export default async function AdminRoomsPage() {
  const roomTypes = await db.roomType.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink-900">Room Management</h1>
      <p className="mt-1 text-sm text-ink-900/50">
        Add room types, adjust prices, and toggle availability. Physical-room status (maintenance,
        per-unit blocks) is managed from the Calendar page.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-ink-900/8 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-900/8 bg-sand-100/60 text-xs uppercase tracking-wider text-ink-900/50">
            <tr>
              <th className="px-5 py-3 text-left">Room Type</th>
              <th className="px-5 py-3 text-left">Total Units</th>
              <th className="px-5 py-3 text-left">Max Guests</th>
              <th className="px-5 py-3 text-left">Price / Night &amp; Status</th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.map((rt) => (
              <tr key={rt.id} className="border-b border-ink-900/5 last:border-0">
                <td className="px-5 py-4 font-medium text-ink-900">{rt.name}</td>
                <td className="px-5 py-4 text-ink-900/70">{rt.totalRooms}</td>
                <td className="px-5 py-4 text-ink-900/70">{rt.maxGuests}</td>
                <td className="px-5 py-4">
                  <RoomRowControls roomTypeId={rt.id} isActive={rt.isActive} basePrice={Number(rt.basePrice)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roomTypes.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-900/50">No room types yet — add one below.</p>
        )}
      </div>

      <div className="mt-10 rounded-xl border border-ink-900/8 bg-white p-6 shadow-card">
        <h2 className="font-serif text-lg text-ink-900">Add Room Type</h2>
        <form action={createRoomType} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input name="name" required placeholder="Name (e.g. Deluxe Room)" className="input" />
          <input name="bedType" required placeholder="Bed Type (e.g. King Bed)" className="input" />
          <input name="basePrice" required type="number" placeholder="Base Price / Night (₹)" className="input" />
          <input name="totalRooms" required type="number" placeholder="Total Units" className="input" />
          <input name="maxGuests" required type="number" placeholder="Max Guests / Room" className="input" />
          <input name="sizeSqft" required type="number" placeholder="Size (sq.ft)" className="input" />
          <input name="amenities" placeholder="Amenities, comma-separated" className="sm:col-span-2 input" />
          <textarea name="description" required placeholder="Description" rows={3} className="sm:col-span-2 input" />
          <button type="submit" className="btn-gold sm:col-span-2">Add Room Type</button>
        </form>
      </div>
    </div>
  );
}
