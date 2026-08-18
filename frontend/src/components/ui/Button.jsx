import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-brand-500 text-white shadow-card hover:bg-brand-600',
  warm:
    'bg-amber-500 text-white shadow-card hover:bg-amber-600',
  ghost:
    'bg-transparent text-ink-600 hover:bg-ink-900/[0.04] hover:text-ink-900',
  danger:
    'bg-rose-600 text-white shadow-card hover:bg-rose-700',
  outline:
    'border border-border-strong bg-white text-ink-700 hover:border-brand-500/60 hover:text-brand-600',
};

const sizes = {
  sm: 'h-9 px-3.5 text-[13px] rounded-lg gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-[15px] rounded-xl gap-2',
  icon: 'h-10 w-10 rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  children,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      className={[
        'ring-focus inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={size === 'sm' ? 15 : 18} className="animate-spin" /> : Icon ? <Icon size={size === 'sm' ? 15 : 18} strokeWidth={2.2} /> : null}
      {children}
    </button>
  );
}