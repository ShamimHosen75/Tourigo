export function SectionBadge({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
      {icon ?? <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
      {children}
    </span>
  );
}
