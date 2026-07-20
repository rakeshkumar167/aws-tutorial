import type { ServiceMeta } from "@/lib/types";
import { TableOfContents } from "./table-of-contents";

export function ServiceLayout({
  meta,
  categoryTitle,
  children,
}: {
  meta: ServiceMeta;
  categoryTitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-accent-ink">{categoryTitle}</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">{meta.title}</h1>
        <p className="mt-2 max-w-2xl text-ink-muted">{meta.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
          <span>{meta.readingMinutes} min read</span>
          {meta.concepts.map((c) => (
            <span key={c} className="rounded-full bg-surface-2 px-2 py-0.5">{c}</span>
          ))}
        </div>
      </header>

      <div className="mt-8 gap-10 lg:grid lg:grid-cols-[1fr_16rem]">
        <article className="min-w-0 max-w-3xl">{children}</article>
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TableOfContents sections={meta.sections} />
          </div>
        </aside>
      </div>
    </div>
  );
}
