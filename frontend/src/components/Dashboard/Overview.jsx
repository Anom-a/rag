import { Link } from 'react-router-dom';
import {
  Files,
  MessagesSquare,
  ShieldCheck,
  ArrowUpRight,
  Database,
  Cpu,
  GitBranch,
  Terminal,
} from 'lucide-react';
import Badge from '../ui/Badge';
import { isAuthenticated } from '../../services/api';

const readList = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export default function Overview() {
  const documents = readList('nexus.uploads.v1');
  const conversations = readList('nexus.conversations.v1');
  const authed = isAuthenticated();

  const stats = [
    {
      icon: Files,
      label: 'Documents uploaded',
      value: documents.length,
      tone: 'bg-brand-500/[0.08] text-brand-600',
      link: { to: '/admin/documents', text: 'Manage sources' },
    },
    {
      icon: MessagesSquare,
      label: 'Conversations',
      value: conversations.length,
      tone: 'bg-amber-500/[0.1] text-amber-600',
      link: { to: '/', text: 'Open assistant' },
    },
    {
      icon: ShieldCheck,
      label: 'Session',
      value: authed ? 'Active' : 'Guest',
      tone: authed ? 'bg-emerald-500/[0.1] text-emerald-600' : 'bg-rose-500/[0.1] text-rose-600',
      link: { to: '/admin/settings', text: 'Session details' },
    },
  ];

  const pipeline = [
    { icon: Database, label: 'Ingestion', state: 'ready', tone: 'mint' },
    { icon: Cpu, label: 'Embedding', state: 'ready', tone: 'mint' },
    { icon: GitBranch, label: 'Retrieval', state: 'ready', tone: 'mint' },
    { icon: Terminal, label: 'Generation', state: 'ready', tone: 'brand' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <section className="animate-fade-up rounded-3xl border border-border bg-panel p-6 shadow-card sm:p-8">
        <Badge tone="mint" dot>
          Pipeline operational
        </Badge>
        <h2 className="mt-4 max-w-lg font-display text-2xl font-bold leading-tight tracking-tight text-ink-900 sm:text-3xl">
          Your knowledge base, <span className="text-brand-600">grounded in minutes.</span>
        </h2>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-600">
          Upload documents, test retrieval and chat against your own data — everything stays
          inside your infrastructure.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/admin/documents"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white shadow-card transition-all hover:bg-brand-600 active:scale-95"
          >
            <Files size={16} /> Upload documents
          </Link>
          <Link
            to="/admin/search"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-medium text-ink-700 transition-colors hover:bg-panel-subtle"
          >
            <Database size={16} /> Test retrieval
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-3" style={{ animationDelay: '0.08s' }}>
        {stats.map((s) => (
          <div key={s.label} className="group rounded-3xl border border-border bg-panel p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${s.tone}`}>
                <s.icon size={19} />
              </span>
              <ArrowUpRight size={16} className="text-ink-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-600" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-ink-900">{s.value}</p>
            <p className="mt-1 text-[13px] text-ink-400">{s.label}</p>
            <Link to={s.link.to} className="mt-2 inline-block text-[12px] font-medium text-brand-600 hover:text-brand-700">
              {s.link.text} →
            </Link>
          </div>
        ))}
      </section>

      {/* Pipeline status */}
      <section className="animate-fade-up rounded-3xl border border-border bg-panel p-5 shadow-card sm:p-6" style={{ animationDelay: '0.16s' }}>
        <h3 className="font-display text-[15px] font-semibold text-ink-900">Pipeline status</h3>
        <p className="mt-0.5 text-[12px] text-ink-400">The RAG stages Nexus runs for every query.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pipeline.map((p) => (
            <div key={p.label} className="flex items-center gap-3 rounded-2xl border border-border bg-panel-subtle p-3.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/[0.08] text-brand-600">
                <p.icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink-900">{p.label}</p>
                <p className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-500" />
                  {p.state}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}