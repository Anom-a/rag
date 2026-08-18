import { useState } from 'react';
import { Search, Loader2, FileSearch, Hash, CornerDownRight } from 'lucide-react';
import { searchDocuments } from '../../services/api';
import { useToast } from '../ui/Toast';
import Badge from '../ui/Badge';

const clampScore = (s) => Math.max(0, Math.min(1, Number(s) || 0));

export default function SearchTab() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null); // null = idle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) {
      toast.error('Enter a query to search the knowledge base.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await searchDocuments(q, 5);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Search failed.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search bar */}
      <section className="animate-fade-up rounded-3xl border border-border bg-panel p-5 shadow-card sm:p-6">
        <h3 className="font-display text-[15px] font-semibold text-ink-900">Semantic search</h3>
        <p className="mt-0.5 text-[12px] text-ink-400">
          Embed a query and retrieve the most relevant chunks from the vector index.
        </p>

        <form onSubmit={run} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. What does the chunking strategy do?"
              className="h-12 w-full rounded-xl border border-border bg-panel-subtle pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition-all focus:border-brand-500/60 focus:bg-white focus:ring-2 focus:ring-brand-500/15"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white shadow-card transition-all hover:bg-brand-600 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </section>

      {/* Results */}
      {loading && (
        <div className="animate-fade-in flex items-center gap-3 rounded-3xl border border-border bg-panel p-6 shadow-card">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: '120ms' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: '240ms' }} />
          </div>
          <p className="text-[13px] text-ink-400">Embedding query and scanning the index…</p>
        </div>
      )}

      {!loading && error && (
        <div className="animate-fade-in rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-card">
          <p className="text-[13px] font-medium text-rose-700">{error}</p>
          <p className="mt-1 text-[12px] text-rose-600">Make sure the backend and MongoDB are running.</p>
        </div>
      )}

      {!loading && results !== null && results.length === 0 && !error && (
        <div className="animate-fade-in flex flex-col items-center rounded-3xl border border-border bg-panel p-10 text-center shadow-card">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-900/[0.04] text-ink-400">
            <FileSearch size={24} />
          </div>
          <p className="mt-4 text-[14px] font-medium text-ink-900">No relevant chunks found</p>
          <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-ink-600">
            Either the knowledge base is empty or the score was below the minimum threshold. Try uploading more documents.
          </p>
        </div>
      )}

      {!loading && results !== null && results.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="animate-fade-up flex items-center gap-2 text-[12px] text-ink-400">
            <CornerDownRight size={13} className="text-brand-600" />
            {results.length} matching chunk{results.length > 1 ? 's' : ''} retrieved
          </p>
          {results.map((r, i) => {
            const score = clampScore(r.score);
            return (
              <article
                key={i}
                className="animate-fade-up rounded-3xl border border-border bg-panel p-5 shadow-card transition-colors hover:border-brand-500/40"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500/[0.08] text-brand-600">
                    <Hash size={14} />
                  </span>
                  <span className="text-[13px] font-semibold text-ink-900">Result {i + 1}</span>
                  {r.source_id && <Badge tone="neutral">source: {r.source_id}</Badge>}
                  <span className="ml-auto flex items-center gap-2">
                    <span className="text-[11px] tabular-nums text-ink-400">{(Number(r.score) || 0).toFixed(3)}</span>
                    <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-ink-100">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-brand-500"
                        style={{ width: `${score * 100}%` }}
                      />
                    </span>
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-700">
                  {r.text}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {!loading && results === null && (
        <div className="animate-fade-up flex flex-col items-center rounded-3xl border border-border bg-panel p-10 text-center shadow-card" style={{ animationDelay: '0.08s' }}>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-900/[0.04] text-ink-400">
            <FileSearch size={24} />
          </div>
          <p className="mt-4 text-[14px] font-medium text-ink-900">Try a search</p>
          <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-ink-600">
            Results show the exact chunk, its similarity score and source id — the same evidence Nexus uses to answer.
          </p>
        </div>
      )}
    </div>
  );
}