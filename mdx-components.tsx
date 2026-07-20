import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/learning/callout";
import { ConceptCard } from "@/components/learning/concept-card";
import { Diagram } from "@/components/learning/diagram";
import { CodeTabs } from "@/components/learning/code-tabs";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Callout,
    ConceptCard,
    Diagram,
    CodeTabs,
    h2: (props) => (
      <h2 className="mt-12 scroll-mt-24 text-2xl font-semibold text-ink" {...props} />
    ),
    h3: (props) => (
      <h3 className="mt-8 scroll-mt-24 text-xl font-semibold text-ink" {...props} />
    ),
    p: (props) => <p className="my-4 leading-relaxed text-ink-muted" {...props} />,
    ul: (props) => <ul className="my-4 list-disc space-y-2 pl-6 text-ink-muted" {...props} />,
    ol: (props) => <ol className="my-4 list-decimal space-y-2 pl-6 text-ink-muted" {...props} />,
    li: (props) => <li className="leading-relaxed" {...props} />,
    a: (props) => <a className="text-accent-ink underline" {...props} />,
    strong: (props) => <strong className="font-semibold text-ink" {...props} />,
    code: (props) => (
      <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-accent-ink" {...props} />
    ),
    pre: (props) => (
      <pre className="my-6 overflow-x-auto rounded-xl border border-border bg-surface-2 p-4 text-sm" {...props} />
    ),
    ...components,
  };
}
