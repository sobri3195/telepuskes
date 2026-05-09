import { Bell, LogOut, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function TopHeader() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
      <div className="flex min-h-16 flex-wrap items-center gap-3 px-3 py-2 sm:flex-nowrap sm:px-4 lg:px-6">
        <div className="min-w-0 lg:hidden">
          <b className="block truncate">Telehealth AU</b>
          <p className="truncate text-xs text-muted-foreground sm:hidden">{user?.role ?? 'Simulasi'}</p>
        </div>
        <div className="relative order-3 w-full sm:order-none sm:max-w-md sm:flex-1 md:block">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="h-10 pl-9" placeholder="Cari konsultasi, faskes, satuan..." />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Bell className="h-5 w-5 text-slate-500" />
          <div className="hidden text-right sm:block">
            <p className="max-w-40 truncate text-sm font-semibold">{user?.name ?? 'Guest'}</p>
            <p className="max-w-40 truncate text-xs text-muted-foreground">{user?.role ?? 'Simulasi'}</p>
          </div>
          <Button size="sm" variant="outline" onClick={logout} aria-label="Keluar">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
