export function SectionBadge({ children, icon, className = '' }: { children: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-gradient-to-r from-brand-50/90 via-sky-50/80 to-cyan-50/70 px-3.5 py-1.5 text-[11px] font-bold tracking-wider uppercase text-brand-700 shadow-sm shadow-brand-500/10 backdrop-blur-md transition-all duration-300 hover:border-brand-300 hover:shadow-brand-500/20 ${className}`}>
      {icon ?? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

