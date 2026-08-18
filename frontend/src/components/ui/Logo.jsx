/**
 * Nexus brand mark — a solid brand "spark" glyph.
 * Use <Logo /> for the bare mark, <Logo wordmark /> for mark + name.
 */
export default function Logo({ wordmark = false, size = 36, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative grid place-items-center rounded-xl bg-brand-500 shadow-card"
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.55}
          height={size * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 17V7l8 8 8-8v10" />
        </svg>
      </div>
      {wordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-ink-900">
          Nexus<span className="text-brand-600">.</span>
        </span>
      )}
    </div>
  );
}