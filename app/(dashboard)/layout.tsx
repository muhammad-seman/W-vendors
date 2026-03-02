import { cookies } from 'next/headers';
import { getInjection } from '@/di/container';
import { SESSION_COOKIE } from '@/config';

import { SidebarProvider } from './_components/sidebar-context';
import { Sidebar } from './_components/sidebar';
import { Topbar } from './_components/topbar';
import { Footer } from './_components/footer';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  const authService = getInjection('IAuthenticationService');
  const { user } = await authService.validateSession(sessionId ?? '');

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar role={user?.role ?? 'vendor'} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto w-full p-6">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
