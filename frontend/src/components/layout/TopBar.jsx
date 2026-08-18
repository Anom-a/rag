import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, LogOut } from 'lucide-react';
import Logo from '../ui/Logo';
import Badge from '../ui/Badge';

export default function TopBar() {
  const navigate = useNavigate();
  const hasToken = !!localStorage.getItem('adminToken');

  const linkClass = ({ isActive }) =>
    [
      'inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
      isActive
        ? 'bg-ink-900/[0.05] text-ink-900'
        : 'text-ink-600 hover:bg-ink-900/[0.04] hover:text-ink-900',
    ].join(' ');

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          className="flex shrink-0 items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-ink-900/[0.04] active:scale-[0.97]"
          aria-label="Go to assistant"
        >
          <Logo size={28} />
          <span className="hidden font-display text-base font-bold tracking-tight text-ink-900 md:block">
            Nexus<span className="text-brand-600">.</span>
          </span>
        </button>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            <Sparkles size={16} className="text-brand-600" />
            <span className="hidden sm:block">Assistant</span>
          </NavLink>
          <NavLink
            to={hasToken ? '/admin' : '/login'}
            className={linkClass}
          >
            <LayoutDashboard size={16} className="text-ink-400" />
            <span className="hidden sm:block">Admin</span>
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <Badge tone="mint" dot className="hidden lg:inline-flex">
            Online
          </Badge>
          {hasToken && (
            <button
              onClick={() => {
                localStorage.removeItem('adminToken');
                navigate('/');
              }}
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-900"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}