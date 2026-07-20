export function ConceptCard({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="not-prose rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
      <div className="mb-1 text-sm font-semibold text-accent-ink">{term}</div>
      <div className="text-sm leading-relaxed text-ink-muted">{children}</div>
    </div>
  );
}
