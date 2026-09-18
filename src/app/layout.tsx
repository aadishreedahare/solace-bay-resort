import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.solacebayresort.com'),
  title: {
    default: 'Solace Bay Resort & Spa — Beachfront Resort in Alibaug',
    template: '%s | Solace Bay Resort & Spa',
  },
  description:
    'A boutique beachfront resort in Alibaug, Maharashtra. Book directly for the best rates on sea-view rooms, suites, and family rooms — pool, spa, and multi-cuisine dining on site.',
  openGraph: {
    title: 'Solace Bay Resort & Spa — Beachfront Resort in Alibaug',
    description: 'Where the coast meets calm. Book your stay directly for the best rate, guaranteed.',
    url: 'https://www.solacebayresort.com',
    siteName: 'Solace Bay Resort & Spa',
    locale: 'en_IN',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
