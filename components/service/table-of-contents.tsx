import type { ServiceSection } from "@/lib/types";

export function TableOfContents({ sections }: { sections: readonly ServiceSection[] }) {
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-2 font-semibold text-ink">On this page</p>
      <ul className="space-y-1.5">
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} className="text-ink-muted hover:text-accent-ink">
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
