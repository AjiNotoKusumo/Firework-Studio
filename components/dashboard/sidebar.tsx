'use client';

import { BarChart3, TrendingUp, Bookmark, Calendar, PenSquare, Leaf, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Plus, label: 'Create', href: '/dashboard/posts/create', highlight: true },
  { icon: BarChart3, label: 'Metrics', href: '/dashboard/metrics' },
  { icon: TrendingUp, label: 'Trending', href: '/dashboard/trending' },
  { icon: Bookmark, label: 'Saved', href: '/dashboard/saved' },
  { icon: PenSquare, label: 'Planning', href: '/dashboard/planning' },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-6 py-6 hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#A7D7A0]">
            <Image src="/firework.png" alt="FireWork Logo" width={30} height={30} className="object-contain" />
          </div>
          <span className="text-xl font-semibold text-foreground">FireWork</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === '/dashboard/posts/create' && pathname.startsWith('/dashboard/posts'));
              const isHighlight = 'highlight' in item && item.highlight;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-medium transition-all',
                      isHighlight && !isActive ? 'bg-[#FFD54F] text-[#2E2E2E] hover:bg-[#FFCA28]'
                      : isActive ? 'bg-[#A7D7A0] text-[#2E2E2E]'
                      : 'text-muted-foreground hover:bg-[#E8F5E9] hover:text-foreground',
                    )}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <Link href="/dashboard/profile" className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-[16px] bg-[#E8F5E9] px-4 py-3">
            <div className="h-9 w-9 rounded-full bg-[#A7D7A0] flex items-center justify-center">
              <span className="text-sm font-medium text-[#2E2E2E]">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Jane Doe</p>
              <p className="text-xs text-muted-foreground truncate">Premium Plan</p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
