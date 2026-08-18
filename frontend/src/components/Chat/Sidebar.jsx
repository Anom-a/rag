import React from 'react';
import { Plus, Search, X, Trash2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import Logo from '../ui/Logo';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Sidebar({
  isOpen,
  onClose,
  conversations,
  activeId,
  onNew,
  onSelect,
  onDelete,
  collapsed,
  onToggleCollapsed,
}) {
  const [query, setQuery] = React.useState('');
  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col border-r border-border bg-white transition-transform duration-300 lg:static lg:inset-auto lg:z-auto lg:h-auto lg:translate-x-0 ${
          collapsed ? 'lg:w-[68px]' : 'lg:w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        {collapsed ? (
          <div className="flex h-14 items-center justify-center border-b border-border px-2">
            <button onClick={onNew} aria-label="New conversation">
              <Logo size={26} />
            </button>
          </div>
        ) : (
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <button onClick={onNew} className="flex items-center gap-2" aria-label="Nexus home">
              <Logo size={28} wordmark />
            </button>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-700 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* New chat */}
        <div className={collapsed ? 'flex justify-center px-2 pt-3' : 'px-4 pt-3'}>
          {collapsed ? (
            <button
              onClick={onNew}
              aria-label="New conversation"
              className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white shadow-card transition-colors hover:bg-brand-600"
            >
              <Plus size={17} strokeWidth={2.4} />
            </button>
          ) : (
            <button
              onClick={onNew}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-600"
            >
              <Plus size={17} strokeWidth={2.6} /> New conversation
            </button>
          )}
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-4 pt-3">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations…"
                className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-[13px] text-ink-700 placeholder:text-ink-400 outline-none transition-colors focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        )}

        {/* Conversation list */}
        <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
          {!collapsed && (
            <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
              Chats
            </p>
          )}
          {filtered.length === 0 && !collapsed && (
            <p className="px-2 py-6 text-center text-[13px] text-ink-400">
              No conversations found.
            </p>
          )}
          {filtered.map((c) => {
            const isActive = c.id === activeId;
            const last = c.messages[c.messages.length - 1];

            if (collapsed) {
              return (
                <div
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  title={c.title}
                  className={`group relative flex cursor-pointer items-center justify-center rounded-xl py-2 transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-ink-400 hover:bg-ink-900/[0.04] hover:text-ink-700'
                  }`}
                >
                  <MessageSquare size={17} />
                </div>
              );
            }

            return (
              <div
                key={c.id}
                className={`group relative flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2.5 transition-colors ${
                  isActive ? 'bg-brand-50' : 'hover:bg-ink-900/[0.04]'
                }`}
                onClick={() => onSelect(c.id)}
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${
                    isActive ? 'bg-brand-500/15 text-brand-600' : 'bg-ink-900/[0.04] text-ink-400'
                  }`}
                >
                  <MessageSquare size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-[13px] font-medium ${
                      isActive ? 'text-brand-700' : 'text-ink-700'
                    }`}
                  >
                    {c.title}
                  </p>
                  <p className="truncate text-[11px] text-ink-400">
                    {last?.role === 'user' ? 'You · ' : ''}
                    {last?.content?.slice(0, 28) || 'Empty conversation'}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] tabular-nums text-ink-400">
                  {timeAgo(c.updatedAt)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                  className="absolute -right-1 -top-1 hidden h-6 w-6 place-items-center rounded-md bg-rose-600 text-white shadow-card transition-transform group-hover:grid"
                  aria-label="Delete conversation"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3">
          {collapsed ? (
            <div className="flex justify-center">
              <button
                onClick={onToggleCollapsed}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-700"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500 text-[11px] font-bold text-white">
                NX
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink-700">Nexus Assistant</p>
                <p className="flex items-center gap-1 text-[11px] text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-500" />
                  Ready
                </p>
              </div>
              <button
                onClick={onToggleCollapsed}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-700"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}