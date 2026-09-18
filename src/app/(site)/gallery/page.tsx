import type { Metadata } from 'next';
import { db } from '@/server/db';
import { PlaceholderImage } from '@/components/site/placeholder-image';

export const metadata: Metadata = { title: 'Gallery' };
export const revalidate = 60;

export default async function GalleryPage() {
  const images = await db.galleryImage.findMany({ orderBy: { order: 'asc' } }).catch(() => []);

  const items = images.length > 0
    ? images
    : ['Exterior', 'Lobby', 'Rooms', 'Restaurant', 'Pool', 'Events', 'Spa', 'Gardens'].map((category, i) => ({
        id: String(i),
        category,
        url: '',
      }));

  return (
    <div className="py-16">
      <div className="container-site">
        <h1 className="font-serif text-3xl text-ink-900 sm:text-4xl">Gallery</h1>
        <p className="mt-3 max-w-lg text-sm text-ink-900/60">
          A look at Solace Bay across every corner of the property.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((img, i) => (
            <PlaceholderImage
              key={img.id}
              seed={i}
              src={img.url || `/images/gallery-${i + 1}.jpg`}
              label={img.category}
              className="h-56 rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}