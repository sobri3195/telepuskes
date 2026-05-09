import { Outlet } from 'react-router-dom';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { SidebarNavigation } from './SidebarNavigation';
import { TopHeader } from './TopHeader';

export function WebAppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarNavigation />
      <div className="lg:pl-72">
        <TopHeader />
        <main className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:px-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNavigation />
    </div>
  );
}
