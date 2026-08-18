const tones = {
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  warm: 'bg-amber-50 text-amber-700 border-amber-200',
  mint: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  neutral: 'bg-ink-900/[0.03] text-ink-600 border-border',
};

export default function Badge({ tone = 'neutral', dot = false, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${tones[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}