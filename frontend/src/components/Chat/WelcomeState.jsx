import { FileText, FolderGit2, Search, MessageSquareText, ArrowUpRight } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Search,
    title: 'Summarize',
    desc: 'Condense a document into key takeaways',
    prompt: 'Summarize the main points of our latest product document.',
    iconColor: 'text-brand-600',
  },
  {
    icon: FolderGit2,
    title: 'Compare',
    desc: 'Spot differences across your sources',
    prompt: 'Compare the API and web client documentation.',
    iconColor: 'text-amber-600',
  },
  {
    icon: FileText,
    title: 'Draft',
    desc: 'Generate from your own knowledge',
    prompt: 'Draft a release note for the new search feature.',
    iconColor: 'text-emerald-600',
  },
  {
    icon: MessageSquareText,
    title: 'Explain',
    desc: 'Break down complex topics simply',
    prompt: 'Explain how retrieval-augmented generation works.',
    iconColor: 'text-sky-600',
  },
];

export default function WelcomeState({ onPrompt, onUpload }) {
  return (
    <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-3 sm:px-6">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center py-10">
        <div className="animate-fade-up text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            What can I help you with?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-600">
            Ask anything — Nexus answers exclusively from your knowledge base.
          </p>
        </div>

        <div
          className="mt-8 grid animate-fade-up grid-cols-1 gap-3 sm:grid-cols-2"
          style={{ animationDelay: '0.1s' }}
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s.title}
              onClick={() => onPrompt(s.prompt)}
              className="group rounded-2xl border border-border bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/50 hover:shadow-float"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-900/[0.04]">
                  <s.icon size={17} className={s.iconColor} />
                </span>
                <ArrowUpRight
                  size={16}
                  className="text-ink-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600"
                />
              </div>
              <p className="mt-3 text-[15px] font-semibold text-ink-900">{s.title}</p>
              <p className="mt-1 text-[13px] leading-snug text-ink-600">{s.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 flex animate-fade-up justify-center" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={onUpload}
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-border-strong bg-white px-5 py-2.5 text-[13px] font-medium text-ink-600 transition-colors hover:border-brand-500/60 hover:text-brand-600"
          >
            <FileText size={15} />
            Upload a document to grow the knowledge base
          </button>
        </div>
      </div>
    </div>
  );
}