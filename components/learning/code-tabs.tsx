"use client";

import { useState } from "react";

export interface CodeTab {
  label: string;
  language: string;
  code: string;
}

export function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(0);
  const current = tabs[active];
  const tabId = (i: number) => `code-tab-${i}`;
  const panelId = (i: number) => `code-tabpanel-${i}`;

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-border bg-surface-2">
      <div role="tablist" aria-label="Code variants" className="flex flex-wrap gap-1 border-b border-border bg-surface px-2 pt-2">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            id={tabId(i)}
            role="tab"
            aria-selected={i === active}
            aria-controls={panelId(i)}
            onClick={() => setActive(i)}
            className={
              "rounded-t-md px-3 py-1.5 text-sm font-medium transition " +
              (i === active
                ? "bg-surface-2 text-accent-ink"
                : "text-ink-muted hover:text-ink")
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
      <pre
        id={panelId(active)}
        role="tabpanel"
        aria-labelledby={tabId(active)}
        className="overflow-x-auto p-4 text-sm leading-relaxed"
      >
        <code data-language={current.language} className="font-mono">
          {current.code}
        </code>
      </pre>
    </div>
  );
}
