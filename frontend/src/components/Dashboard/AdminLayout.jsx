import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Files, Search, Settings, ShieldCheck } from 'lucide-react';
import { isAuthenticated } from '../../services/api';

const ITEMS = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Overview', desc: 'Pipeline & quick actions' },
  { to: '/admin/documents', icon: Files, label: 'Documents', desc: 'Upload & manage sources' },
  { to: '/admin/search', icon: Search, label: 'Search', desc: 'Test semantic retrieval' },
  { to: '/admin/settings', icon: Settings, label: 'Settings', desc: 'Connection & data' },
];

export default function AdminLayout() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-16 pt-20 sm:px-6">
      <div className="mb-6 flex animate-fade-up items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500/[0.08] text-brand-600">
          <ShieldCheck size={20} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
            Admin Console
          </h1>
          <p className="text-[13px] text-ink-400">Manage the knowledge base behind Nexus.</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-20 hidden h-fit w-56 shrink-0 flex-col gap-1 lg:flex">
          {ITEMS.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `group flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                  isActive
                    ? 'border-brand-500/30 bg-brand-500/[0.06]'
                    : 'border-transparent hover:border-border hover:bg-ink-900/[0.04]'
                }`
              }
            >
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500/[0.08] text-brand-600">
                <it.icon size={17} />
              </span>
              <span>
                <span className="block text-[14px] font-semibold text-ink-900">{it.label}</span>
                <span className="block text-[12px] text-ink-400">{it.desc}</span>
              </span>
            </NavLink>
          ))}
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          {/* Mobile tab bar */}
          <div className="scroll-slim -mx-3 mb-4 flex gap-2 overflow-x-auto px-3 pb-1 lg:hidden">
            {ITEMS.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'border-brand-500/30 bg-brand-500/[0.06] text-brand-700'
                      : 'border-border bg-white text-ink-600'
                  }`
                }
              >
                <it.icon size={15} />
                {it.label}
              </NavLink>
            ))}
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}