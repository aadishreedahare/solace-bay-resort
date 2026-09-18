import Link from 'next/link';

const NAV_LINKS = [
  { href: '/rooms', label: 'Rooms & Suites' },
  { href: '/services', label: 'Dining & Spa' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/offers', label: 'Offers' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/8 bg-sand-50/95 backdrop-blur">
      <div className="container-site flex h-20 items-center justify-between">
        <Link href="/" className="font-serif text-2xl tracking-[0.15em] text-ink-900">
          SOLACE <span className="text-gold-500">BAY</span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-900/75 transition hover:text-gold-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-ink-900/75 hover:text-gold-500 sm:block"
          >
            Sign In
          </Link>
          <Link href="/rooms" className="btn-gold !py-2.5">
            Book Now
          </Link>
        </div>
      </div>
    </header>
  );
}
