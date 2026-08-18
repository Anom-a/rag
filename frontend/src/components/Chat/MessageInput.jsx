import React, { useEffect, useRef } from 'react';
import { Paperclip, Mic, SendHorizontal, Sparkles } from 'lucide-react';
import { useToast } from '../ui/Toast';

const MAX_HEIGHT = 160;

export default function MessageInput({ onSend, isLoading, onAttachClick }) {
  const [text, setText] = React.useState('');
  const ref = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [text]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-6 sm:pb-5">
      <div className="pointer-events-auto mx-auto max-w-[820px]">
        <div className="rounded-2xl border border-border bg-white p-2 shadow-float">
          <div className="flex items-end gap-1.5">
            {/* Attach */}
            <button
              onClick={onAttachClick}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-400 transition-colors hover:bg-ink-900/[0.05] hover:text-brand-600"
              aria-label="Attach a document"
              title="Attach a document"
            >
              <Paperclip size={18} />
            </button>

            {/* Textarea */}
            <textarea
              ref={ref}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ask Nexus anything…"
              className="scroll-slim max-h-[160px] flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-relaxed text-ink-900 placeholder:text-ink-400 outline-none"
            />

            {/* Mic (decorative) */}
            <button
              onClick={() => toast.info('Voice input is on the roadmap.')}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-400 transition-colors hover:bg-ink-900/[0.05] hover:text-amber-600"
              aria-label="Voice input"
              title="Voice input (soon)"
            >
              <Mic size={18} />
            </button>

            {/* Send */}
            <button
              onClick={submit}
              disabled={!text.trim() || isLoading}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-card transition-all duration-200 hover:bg-brand-600 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Send message"
              title="Send (Enter)"
            >
              <SendHorizontal size={17} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
          <Sparkles size={12} className="text-brand-500" />
          Nexus can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}