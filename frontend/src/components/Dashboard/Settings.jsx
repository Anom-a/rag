import { useState } from 'react';
import { Link as LinkIcon, Database, ShieldCheck, UserX, PlugZap, Trash2 } from 'lucide-react';
import { isAuthenticated, logout, searchDocuments } from '../../services/api';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

export default function Settings() {
  const toast = useToast();
  const [authed, setAuthed] = useState(isAuthenticated());
  const [testing, setTesting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    try {
      await searchDocuments('connection probe', 1);
      toast.success('Backend reachable — retrieval pipeline responded.');
    } catch (err) {
      toast.error(err.message || 'Backend unreachable.');
    } finally {
      setTesting(false);
    }
  };

  const clearLocal = () => {
    localStorage.removeItem('nexus.conversations.v1');
    localStorage.removeItem('nexus.uploads.v1');
    setConfirmClear(false);
    toast.success('Local conversations and upload history cleared.');
  };

  const rows = [
    {
      icon: LinkIcon,
      title: 'API endpoint',
      desc: API_BASE || 'Same origin (VITE_API_URL not set)',
      tone: 'bg-brand-500/[0.08] text-brand-600',
      action: (
        <Button variant="ghost" size="sm" loading={testing} onClick={testConnection} icon={!testing ? PlugZap : null}>
          Test connection
        </Button>
      ),
    },
    {
      icon: ShieldCheck,
      title: 'Session',
      desc: authed ? 'Signed in with a valid admin token' : 'Guest — read-only mode',
      tone: authed ? 'bg-emerald-500/[0.1] text-emerald-600' : 'bg-rose-500/[0.1] text-rose-600',
      action: authed ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            setAuthed(false);
            toast.info('Signed out.');
          }}
          icon={UserX}
        >
          Sign out
        </Button>
      ) : null,
    },
    {
      icon: Database,
      title: 'Local data',
      desc: 'Conversations and upload history stored in this browser',
      tone: 'bg-amber-500/[0.1] text-amber-600',
      action: (
        <Button variant="danger" size="sm" onClick={() => setConfirmClear(true)} icon={Trash2}>
          Clear local data
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <section className="animate-fade-up rounded-3xl border border-border bg-panel p-2 shadow-card">
        {rows.map((r, i) => (
          <div
            key={r.title}
            className={`flex flex-wrap items-center gap-4 p-4 ${i > 0 ? 'border-t border-border' : ''}`}
          >
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${r.tone}`}>
              <r.icon size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-ink-900">{r.title}</p>
              <p className="mt-0.5 truncate text-[12px] text-ink-400">{r.desc}</p>
            </div>
            {r.action}
          </div>
        ))}
      </section>

      <p className="px-1 text-center text-[11px] leading-relaxed text-ink-400">
        The knowledge base itself lives in MongoDB + the embedding service. These settings only
        affect this browser session.
      </p>

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="Clear local data?">
        <p className="text-[13px] leading-relaxed text-ink-600">
          This removes all conversations and the local upload history kept in this browser. Nothing
          is deleted from the server-side knowledge base.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmClear(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={clearLocal} icon={Trash2}>
            Clear everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}