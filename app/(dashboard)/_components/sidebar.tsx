'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Package, Tag } from 'lucide-react';

import { cn } from '@/app/_components/utils';
import { useSidebar } from './sidebar-context';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/',           icon: Home    },
  { name: 'Pengguna',  href: '/users',      icon: Users,   roles: ['admin', 'dev'] },
  { name: 'Produk',    href: '/products',   icon: Package },
  { name: 'Kategori',  href: '/categories', icon: Tag,     roles: ['admin', 'dev'] },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { open } = useSidebar();

  const filteredItems = NAV_ITEMS.filter(item => !item.roles || item.roles.includes(role));

  return (
    <aside
      className={cn(
        'flex-shrink-0 h-full border-r bg-card text-card-foreground flex flex-col transition-all duration-200 ease-in-out',
        open ? 'w-56' : 'w-14'
      )}
    >
      {/* Logo header — always visible */}
      <div className="flex h-20 items-center border-b border-border px-3 overflow-hidden">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/square-logo.png"
            alt="WithVendor"
            width={32}
            height={32}
            className="h-8 w-8 rounded-md flex-shrink-0 object-contain"
          />
          {open && (
            <span className="text-base font-bold tracking-tight text-foreground whitespace-nowrap overflow-hidden">
              With<span className="text-indigo-500">Vendor</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto overflow-x-hidden">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={!open ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                open ? 'justify-start' : 'justify-center',
                isActive
                  ? 'bg-indigo-500/10 text-indigo-500'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', isActive && 'text-indigo-500')} />
              {open && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
