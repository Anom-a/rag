import { useEffect, useRef, useState } from 'react';
import { Check, Copy, MessageSquareText, ShieldCheck, User } from 'lucide-react';
import { useToast } from '../ui/Toast';

/* --- tiny safe formatter: **bold**, `code`, *italic*, bullets, line breaks --- */
function renderInline(text) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**'))
      parts.push(
        <strong key={parts.length} className="font-semibold text-ink-900">
          {tok.slice(2, -2)}
        </strong>
      );
    else if (tok.startsWith('`'))
      parts.push(
        <code key={parts.length} className="rounded border border-border bg-ink-100 px-1.5 py-0.5 font-mono text-[0.86em] text-brand-700">
          {tok.slice(1, -1)}
        </code>
      );
    else
      parts.push(<em key={parts.length} className="text-ink-700">{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Rich({ text, streaming }) {
  const lines = text.split('\n');
  const blocks = [];
  let list = null;

  const flush = () => {
    if (list) {
      blocks.push(<ul key={`u${blocks.length}`} className="my-1.5 space-y-1">{list}</ul>);
      list = null;
    }
  };

  lines.forEach((line) => {
    const bullet = line.match(/^\s*[-*•]\s+(.*)/);
    if (bullet) {
      if (!list) list = [];
      list.push(
        <li key={`l${blocks.length}-${list.length}`} className="flex gap-2 text-ink-700">
          <span className="text-brand-500">—</span>
          <span>{renderInline(bullet[1])}</span>
        </li>
      );
      return;
    }
    flush();
    if (!line.trim()) return;
    blocks.push(
      <p key={`p${blocks.length}`} className="my-1 leading-relaxed text-ink-700">
        {renderInline(line)}
      </p>
    );
  });
  flush();

  return (
    <div className="space-y-1">
      {blocks}
      {streaming && (
        <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] animate-caret rounded-full bg-brand-500" />
      )}
    </div>
  );
}

function CopyButton({ text }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error('Clipboard unavailable.');
    }
  };

  return (
    <button
      onClick={copy}
      className={`grid h-7 w-7 place-items-center rounded-lg transition-colors ${
        copied
          ? 'text-emerald-600'
          : 'text-ink-400 hover:bg-ink-900/[0.05] hover:text-ink-700'
      }`}
      aria-label="Copy response"
      title="Copy response"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3.5">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: '120ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: '240ms' }} />
      </div>
      <span className="text-[12px] text-ink-400">Nexus is thinking…</span>
    </div>
  );
}

export default function MessageList({ messages, isLoading }) {
  const endRef = useRef(null);
  const lastIsUser = messages[messages.length - 1]?.role === 'user';

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  return (
    <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-3 pb-36 pt-6 sm:px-6">
      <div className="mx-auto flex max-w-[760px] flex-col gap-5">
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          const isStreaming = !isUser && i === messages.length - 1 && isLoading;
          const isError = !isUser && m.content?.startsWith('_[');

          return (
            <div
              key={i}
              className={`flex animate-fade-up items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* avatar */}
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                  isUser
                    ? 'bg-ink-900/[0.05] text-ink-400 ring-1 ring-border'
                    : 'bg-brand-500 text-white shadow-card'
                }`}
              >
                {isUser ? <User size={15} /> : <MessageSquareText size={15} strokeWidth={2.4} />}
              </div>

              {/* bubble */}
              <div className={`group flex min-w-0 max-w-[82%] flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                {isUser ? (
                  <div className="whitespace-pre-wrap rounded-2xl rounded-tr-md bg-user-bubble px-4 py-2.5 text-sm font-medium leading-relaxed text-ink-900">
                    {m.content}
                  </div>
                ) : (
                  <div
                    className={`relative min-w-0 rounded-2xl rounded-tl-md border px-4 py-3 text-[14px] leading-relaxed ${
                      isError
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-transparent bg-transparent'
                    }`}
                  >
                    {m.content ? (
                      <Rich text={m.content} streaming={isStreaming} />
                    ) : (
                      <div className="flex items-center gap-2 py-1">
                        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-brand-500" />
                        <span className="text-[12px] text-ink-400">Streaming…</span>
                      </div>
                    )}
                  </div>
                )}

                {/* meta row (hover-reveal) */}
                {!isUser && m.content && (
                  <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <CopyButton text={m.content} />
                    <span
                      className="grid h-7 w-7 place-items-center rounded-lg text-ink-400"
                      title="Grounded in your knowledge base"
                    >
                      <ShieldCheck size={14} />
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* connecting state (no empty assistant msg yet) */}
        {isLoading && lastIsUser && (
          <div className="animate-fade-up flex items-start gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500 text-white shadow-card">
              <MessageSquareText size={15} strokeWidth={2.4} />
            </div>
            <div className="rounded-2xl rounded-tl-md border border-border bg-white px-4 py-3 shadow-card">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}