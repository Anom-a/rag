import { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, Plus, Share2, Trash2, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import WelcomeState from './WelcomeState';
import { streamChat, isAuthenticated, uploadFileDocument } from '../../services/api';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';

const STORAGE_KEY = 'nexus.conversations.v1';
const SIDEBAR_KEY = 'nexus.sidebar.collapsed';
const uid = () => Math.random().toString(36).slice(2, 10);

function seedConversation() {
  return {
    id: uid(),
    title: 'Welcome to Nexus',
    updatedAt: Date.now(),
    messages: [
      {
        role: 'assistant',
        content:
          'Hello! I am Nexus, your grounded AI assistant. I answer using only the knowledge base you upload — no invented facts. Try asking me anything, or start by uploading a document from the admin console.',
      },
    ],
  };
}

export default function Chat() {
  const toast = useToast();
  const [conversations, setConversations] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {
      /* fall through to seed */
    }
    return [seedConversation()];
  });
  const [activeId, setActiveId] = useState(() => conversations[0]?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [clearOpen, setClearOpen] = useState(false);
  const fileRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId) || conversations[0];
  const messages = useMemo(() => active?.messages || [], [active]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(-8)));
    } catch {
      /* storage may be unavailable */
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
    } catch {
      /* storage may be unavailable */
    }
  }, [collapsed]);

  const updateActive = (fn) => {
    setConversations((prev) => prev.map((c) => (c.id === activeId ? fn(c) : c)));
  };

  const newChat = () => {
    const conv = seedConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setIsSidebarOpen(false);
  };

  const selectChat = (id) => {
    setActiveId(id);
    setIsSidebarOpen(false);
  };

  const deleteChat = (id) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const fresh = seedConversation();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
    toast.info('Conversation deleted.');
  };

  const clearActive = () => {
    updateActive((c) => ({
      ...c,
      title: 'New conversation',
      updatedAt: Date.now(),
      messages: [],
    }));
    setClearOpen(false);
    toast.success('Conversation cleared.');
  };

  const handleSend = async (text) => {
    const userMsg = { role: 'user', content: text, ts: Date.now() };
    const emptyAssistant = { role: 'assistant', content: '', ts: Date.now() };

    updateActive((c) => {
      const wasEmpty = c.messages.length === 0;
      const title =
        wasEmpty || c.title === 'New conversation'
          ? text.slice(0, 42) + (text.length > 42 ? '…' : '')
          : c.title;
      return {
        ...c,
        title,
        updatedAt: Date.now(),
        messages: [...c.messages, userMsg, emptyAssistant],
      };
    });

    setIsLoading(true);
    let acc = '';

    await streamChat(
      text,
      messages,
      (chunk) => {
        acc += chunk;
        updateActive((c) => {
          const next = [...c.messages];
          next[next.length - 1] = { role: 'assistant', content: acc, ts: Date.now() };
          return { ...c, updatedAt: Date.now(), messages: next };
        });
      },
      (err) => {
        console.error('Stream error', err);
        updateActive((c) => {
          const next = [...c.messages];
          const last = next[next.length - 1];
          next[next.length - 1] = {
            ...last,
            content: acc
              ? acc + '\n\n_[Connection interrupted. Check the server and try again.]_'
              : '_[I could not reach the server. Make sure the backend is running and try again.]_',
          };
          return { ...c, messages: next };
        });
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  const handleAttach = (file) => {
    if (!file) return;
    if (!isAuthenticated()) {
      toast.error('Sign in to the admin console to upload documents.');
      return;
    }
    uploadFileDocument(file)
      .then((r) => toast.success(r.message || 'Document uploaded & embedded.'))
      .catch((err) => toast.error(err.message || 'Upload failed.'));
  };

  const share = () => {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => toast.success('Link copied to clipboard.'))
      .catch(() => toast.info('Sharing is coming soon.'));
  };

  return (
    <div className="h-dvh pt-14">
      <div className="flex h-full">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          conversations={conversations}
          activeId={activeId}
          onNew={newChat}
          onSelect={selectChat}
          onDelete={deleteChat}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
        />

        {/* Main panel */}
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Slim header */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-700 lg:hidden"
              aria-label="Open conversations"
            >
              <Menu size={18} />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Sparkles size={15} className="shrink-0 text-brand-600" />
              <h1 className="truncate font-display text-[15px] font-semibold text-ink-900">
                {active?.title || 'New conversation'}
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={newChat}
                className="hidden h-9 items-center gap-1.5 rounded-lg border border-border-strong bg-white px-3 text-[13px] font-medium text-ink-700 transition-colors hover:border-brand-500/60 hover:text-brand-600 sm:inline-flex"
              >
                <Plus size={15} /> New chat
              </button>
              <button
                onClick={share}
                className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-700"
                aria-label="Share conversation"
                title="Share"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={() => setClearOpen(true)}
                disabled={!messages.length}
                className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-rose-500/10 hover:text-rose-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-400"
                aria-label="Clear conversation"
                title="Clear"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </header>

          {/* Body */}
          <div className="relative flex min-h-0 flex-1 flex-col">
            {messages.length === 0 ? (
              <WelcomeState
                onPrompt={(p) => handleSend(p)}
                onUpload={() =>
                  isAuthenticated()
                    ? fileRef.current?.click()
                    : toast.error('Sign in to upload documents.')
                }
              />
            ) : (
              <MessageList messages={messages} isLoading={isLoading} />
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-surface to-transparent" />

            {/* Floating composer */}
            <MessageInput
              onSend={handleSend}
              isLoading={isLoading}
              onAttachClick={() =>
                isAuthenticated()
                  ? fileRef.current?.click()
                  : toast.error('Sign in to upload documents.')
              }
            />
          </div>
        </section>
      </div>

      {/* hidden file input for attach */}
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.md,.pdf,.docx"
        className="hidden"
        onChange={(e) => {
          handleAttach(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {/* Clear confirm modal */}
      <Modal open={clearOpen} onClose={() => setClearOpen(false)} title="Clear conversation">
        <p className="text-sm leading-relaxed text-ink-600">
          This will permanently remove all messages in the current conversation. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            onClick={() => setClearOpen(false)}
            className="h-10 rounded-xl border border-border bg-white px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-900/[0.03]"
          >
            Cancel
          </button>
          <button
            onClick={clearActive}
            className="h-10 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white shadow-card transition-colors hover:bg-rose-700"
          >
            Clear messages
          </button>
        </div>
      </Modal>
    </div>
  );
}