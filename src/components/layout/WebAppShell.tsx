import { Outlet } from 'react-router-dom';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { MapsSidebar } from '@/components/maps/MapsSidebar';
import { useSidebarMapStore } from '@/stores/sidebarMapStore';
import { TopHeader } from './TopHeader';

export function WebAppShell() {
  const isCollapsed = useSidebarMapStore((s) => s.isCollapsed);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <MapsSidebar />
      <div className={isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[360px]'}>
        <TopHeader />
        <main className="mx-auto w-full max-w-7xl px-3 py-4 pb-28 sm:px-4 sm:py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNavigation />
    </div>
  );
}
