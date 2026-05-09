import { Outlet, useLocation } from 'react-router-dom';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { MapsSidebar } from '@/components/maps/MapsSidebar';
import { useSidebarMapStore } from '@/stores/sidebarMapStore';
import { TopHeader } from './TopHeader';

export function WebAppShell() {
  const isCollapsed = useSidebarMapStore((s) => s.isCollapsed);
  const { pathname } = useLocation();
  const isMapsRoute = pathname === '/app/maps';

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <MapsSidebar />
      <div className={isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[280px]'}>
        <TopHeader />
        <main className={`mx-auto w-full px-3 py-4 pb-28 sm:px-4 sm:py-6 ${isMapsRoute ? 'max-w-none lg:px-5' : 'max-w-7xl lg:px-8'}`}>
          <Outlet />
        </main>
      </div>
      <MobileBottomNavigation />
    </div>
  );
}
