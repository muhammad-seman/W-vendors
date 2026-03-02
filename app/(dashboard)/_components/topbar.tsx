'use client';

import { Bell, CalendarIcon, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { UserMenu } from '@/app/_components/ui/user-menu';
import { useSidebar } from './sidebar-context';

const ROUTE_META: Record<string, { title: string; subtitle: string }> = {
  '/':           { title: 'Dashboard', subtitle: 'Ringkasan aktivitas platform' },
  '/users':      { title: 'Pengguna',  subtitle: 'Kelola akun vendor & admin' },
  '/products':   { title: 'Produk',    subtitle: 'Daftar layanan & produk vendor' },
  '/categories': { title: 'Kategori', subtitle: 'Data master kategori produk' },
};

export function Topbar() {
  const pathname = usePathname();
  const { toggle } = useSidebar();

  const meta = ROUTE_META[pathname] ?? {
    title: pathname.split('/')[1]?.charAt(0).toUpperCase() + pathname.split('/')[1]?.slice(1),
    subtitle: '',
  };

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-card text-card-foreground px-6 flex-shrink-0">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          aria-label="Buka/Tutup sidebar"
          className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-lg bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white transition-colors shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
            {meta.title}
          </h1>
          {meta.subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{meta.subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: date range + bell + user */}
      <div className="flex items-center gap-5">
        {pathname === '/' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm w-[140px] justify-between">
              Mulai <CalendarIcon className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <span className="text-muted-foreground/40">→</span>
            <div className="flex items-center rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm w-[140px] justify-between">
              Selesai <CalendarIcon className="h-4 w-4 text-muted-foreground/60" />
            </div>
          </div>
        )}

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-3">
          <div className="relative flex cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground h-9 w-9 rounded-full hover:bg-accent transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
