export default function Field({ label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-ink-700">{label}</label>
        {hint && <span className="text-[11px] text-ink-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-xs font-medium text-rose-600 animate-fade-in">{error}</p>
      )}
    </div>
  );
}