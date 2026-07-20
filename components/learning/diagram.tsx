export function Diagram({ caption, children }: { caption?: string; children: React.ReactNode }) {
  return (
    <figure className="not-prose my-6 rounded-xl border border-border bg-surface p-5">
      <div className="overflow-x-auto">{children}</div>
      {caption ? (
        <figcaption className="mt-3 text-center text-xs text-ink-faint">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
