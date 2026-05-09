import { NavLink } from 'react-router-dom';
import { Building2, HeartPulse, Map, MessageSquare, User } from 'lucide-react';

const items = [
  ['/app/maps', Map, 'Maps'],
  ['/app/needs', HeartPulse, 'Butuh'],
  ['/app/messages', MessageSquare, 'Pesan'],
  ['/app/units', Building2, 'Faskes'],
  ['/app/profile', User, 'Profil'],
] as const;

export function MobileBottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      {items.map(([to, Icon, label]) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-w-0 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium ${isActive ? 'text-primary' : 'text-slate-500'}`
          }
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
