import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const toastStyles = {
  success: { icon: CheckCircle2, ring: 'text-emerald-600', bar: 'bg-emerald-500' },
  error: { icon: XCircle, ring: 'text-rose-600', bar: 'bg-rose-500' },
  info: { icon: Info, ring: 'text-brand-600', bar: 'bg-brand-500' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (type, message, duration = 4200) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-3), { id, type, message }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (m, d) => push('success', m, d),
      error: (m, d) => push('error', m, d),
      info: (m, d) => push('info', m, d),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-[68px] z-[120] flex w-[min(92vw,360px)] flex-col gap-2.5">
        {toasts.map((t) => {
          const S = toastStyles[t.type];
          const Icon = S.icon;
          return (
            <div
              key={t.id}
              className="animate-toast-in pointer-events-auto relative overflow-hidden rounded-xl border border-border bg-white shadow-float"
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${S.bar}`} />
              <div className="flex items-start gap-3 px-4 py-3.5 pl-5">
                <Icon size={19} className={`mt-0.5 shrink-0 ${S.ring}`} />
                <p className="flex-1 text-[13px] leading-snug text-ink-700">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-ink-400 transition-colors hover:text-ink-900"
                  aria-label="Dismiss notification"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}