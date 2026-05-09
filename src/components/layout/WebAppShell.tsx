import { Outlet } from 'react-router-dom';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { MapsSidebar } from '@/components/maps/MapsSidebar';
import { useSidebarMapStore } from '@/stores/sidebarMapStore';
import { TopHeader } from './TopHeader';

export function WebAppShell() {
  const isCollapsed = useSidebarMapStore((s) => s.isCollapsed);

  return (
    <div className="min-h-screen bg-slate-50">
      <MapsSidebar />
      <div className={isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[360px]'}>
        <TopHeader />
        <main className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:px-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNavigation />
    </div>
  );
}
