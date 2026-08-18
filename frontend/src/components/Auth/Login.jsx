import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  FileText,
  MessageSquareText,
} from 'lucide-react';
import { login } from '../../services/api';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import Field from '../ui/Field';
import Badge from '../ui/Badge';
import { useToast } from '../ui/Toast';

const FEATURES = [
  { icon: MessageSquareText, title: 'Grounded answers', desc: 'Every reply cites your own documents.' },
  { icon: Zap, title: 'Streaming replies', desc: 'Token-by-token responses, zero waiting.' },
  { icon: FileText, title: 'Bring your knowledge', desc: 'Paste or upload files in one click.' },
  { icon: ShieldCheck, title: 'Private by design', desc: 'Your data stays in your infrastructure.' },
];

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  const fail = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      fail('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success('Welcome back — you are signed in.');
      navigate('/admin');
    } catch (err) {
      fail(err.message || 'Login failed. Check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-56px)] w-full max-w-6xl items-center px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-10">
        {/* ---------------- Hero / showcase panel ---------------- */}
        <div className="hidden animate-fade-up flex-col lg:flex">
          <div className="relative flex-1 overflow-hidden rounded-3xl border border-border bg-panel p-8 shadow-card">
            <div className="relative">
              <Badge tone="brand" dot>
                Admin access
              </Badge>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink-900">
                One workspace for
                <br />
                <span className="text-brand-600">your knowledge</span>
              </h1>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-600">
                Manage documents, tune retrieval and supervise the assistant from a single,
                beautifully calm console.
              </p>

              {/* animated chat preview */}
              <div className="mt-8 space-y-3">
                <div className="animate-msg-in flex max-w-[80%] gap-2.5">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500 text-white shadow-card">
                    <MessageSquareText size={15} strokeWidth={2.4} />
                  </div>
                  <div className="rounded-2xl rounded-tl-md border border-border bg-white px-4 py-2.5 text-[13px] text-ink-700">
                    How should our knowledge base be structured?
                  </div>
                </div>
                <div className="animate-msg-in ml-auto flex max-w-[80%] justify-end gap-2.5" style={{ animationDelay: '0.15s' }}>
                  <div className="rounded-2xl rounded-tr-md bg-user-bubble px-4 py-2.5 text-[13px] font-medium text-ink-900">
                    Can you compare our product docs?
                  </div>
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-900/[0.05] text-ink-400 ring-1 ring-border">
                    <User size={15} />
                  </div>
                </div>
                <div className="animate-msg-in flex max-w-[86%] gap-2.5" style={{ animationDelay: '0.3s' }}>
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500 text-white shadow-card">
                    <MessageSquareText size={15} strokeWidth={2.4} />
                  </div>
                  <div className="rounded-2xl rounded-tl-md border border-border bg-white px-4 py-2.5 text-[13px] leading-relaxed text-ink-700">
                    Sure — I found 3 matching chunks in <span className="text-brand-700">release-notes.md</span> and{' '}
                    <span className="text-brand-700">api-guide.md</span>.
                    <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-caret bg-brand-500" />
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="group rounded-2xl border border-border bg-panel-subtle p-4 transition-all duration-200 hover:border-brand-500/40 hover:bg-brand-500/[0.04]"
                  >
                    <f.icon size={18} className="text-brand-600 transition-transform duration-200 group-hover:scale-110" />
                    <p className="mt-2.5 text-[13px] font-semibold text-ink-900">{f.title}</p>
                    <p className="mt-1 text-[12px] leading-snug text-ink-600">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- Login form panel ---------------- */}
        <div className="flex animate-fade-up items-center" style={{ animationDelay: '0.08s' }}>
          <form
            onSubmit={handleSubmit}
            className={`relative w-full rounded-3xl border border-border bg-panel p-7 shadow-card sm:p-9 ${shake ? 'animate-shake' : ''}`}
            noValidate
          >
            <Logo size={44} wordmark />

            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900">
                Welcome back
              </h2>
              <p className="mt-1.5 text-sm text-ink-600">
                Sign in to the admin console to manage your knowledge base.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-5">
              <Field label="Username" hint="admin">
                <div className="group relative">
                  <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 transition-colors group-focus-within:text-brand-600" />
                  <input
                    ref={userRef}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="h-12 w-full rounded-xl border border-border bg-panel-subtle pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-400 transition-all outline-none focus:border-brand-500/70 focus:bg-white focus:ring-2 focus:ring-brand-500/15"
                  />
                </div>
              </Field>

              <Field label="Password" hint="Required">
                <div className="group relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 transition-colors group-focus-within:text-brand-600" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-border bg-panel-subtle pl-10 pr-11 text-sm text-ink-900 placeholder:text-ink-400 transition-all outline-none focus:border-brand-500/70 focus:bg-white focus:ring-2 focus:ring-brand-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-700"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
            </div>

            {error && (
              <div className="animate-fade-in mt-5 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                <p className="text-[13px] font-medium text-rose-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="mt-7 w-full"
              icon={!loading ? ArrowRight : null}
            >
              {loading ? 'Signing in…' : 'Sign in to console'}
            </Button>

            <p className="mt-5 text-center text-[12px] text-ink-400">
              Protected by encrypted session tokens · <span className="text-ink-600">Enter ↵ to continue</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}