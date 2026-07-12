// ============================================================
// TransitOps - Application Shell Layout
// Fixed sidebar + top header. All authenticated pages render
// inside this shell via <Outlet />.
// ============================================================

import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useTransitStore } from '#/store/useTransitStore';
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  Fuel,
  BarChart2,
  Settings,
  LogOut,
  Search,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',      href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Fleet',          href: '/fleet',       icon: Truck           },
  { label: 'Drivers',        href: '/drivers',     icon: Users           },
  { label: 'Trips',          href: '/trips',       icon: MapPin          },
  { label: 'Maintenance',    href: '/maintenance', icon: Wrench          },
  { label: 'Fuel & Expenses',href: '/fuel',        icon: Fuel            },
  { label: 'Analytics',      href: '/analytics',   icon: BarChart2       },
  { label: 'Settings',       href: '/settings',    icon: Settings        },
];

// Role abbreviation badge color
const ROLE_COLORS: Record<string, string> = {
  'Fleet Manager':     'bg-amber-500',
  'Dispatcher':        'bg-blue-500',
  'Safety Officer':    'bg-green-600',
  'Financial Analyst': 'bg-purple-600',
};

function roleAbbr(role: string) {
  return role.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function AppLayout() {
  const currentUser = useTransitStore(s => s.currentUser);
  const logout = useTransitStore(s => s.logout);
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = () => {
    logout();
    void navigate({ to: '/login' });
  };

  return (
    <div className="flex h-screen bg-[#0f1117] text-white overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-52 flex-shrink-0 bg-[#161b27] border-r border-white/10 flex flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <Truck size={16} className="text-black" />
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight tracking-tight">TransitOps</div>
              <div className="text-[10px] text-slate-400 leading-none mt-0.5">Smart Transport Platform</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = currentPath === href || currentPath.startsWith(href + '/');
            return (
              <Link
                key={href}
                to={href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150
                  ${isActive
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'}
                `}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 w-full transition-all"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 flex-shrink-0 bg-[#161b27] border-b border-white/10 flex items-center justify-between px-6">
          {/* Global Search */}
          {/* TODO (Backend Integration): Wire global search to GET /api/search?q=... */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#0f1117] border border-white/10 rounded-md pl-9 pr-4 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 w-56 transition-colors"
            />
          </div>

          {/* Profile badge */}
          {currentUser && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">{currentUser.name}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${ROLE_COLORS[currentUser.role] ?? 'bg-slate-600'}`}>
                {roleAbbr(currentUser.role)}
              </div>
              <span className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                {currentUser.role}
              </span>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#0f1117]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
