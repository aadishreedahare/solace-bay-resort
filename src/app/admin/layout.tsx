import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/server/auth';
import {
  LayoutDashboard, BedDouble, CalendarDays, CalendarRange,
  Tag, DollarSign, Star, MessageSquare, Settings,
} from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/rooms', label: 'Rooms', icon: BedDouble },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/calendar', label: 'Calendar', icon: CalendarRange },
  { href: '/admin/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/admin');
  if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') redirect('/');

  return (
    <div className="flex min-h-screen bg-sand-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-900/8 bg-ink-950 lg:flex">
        <div className="px-6 py-7 font-serif text-xl tracking-[0.1em] text-white">
          SOLACE <span className="text-gold-400">BAY</span>
          <div className="mt-0.5 text-[10px] font-sans font-normal uppercase tracking-[0.2em] text-white/40">
            Admin Panel
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 px-6 py-5 text-xs text-white/40">
          Signed in as {session.user.name} ({session.user.role})
        </div>
      </aside>

      <div className="flex-1">
        <div className="min-h-screen p-6 sm:p-10">{children}</div>
      </div>
    </div>
  );
}
