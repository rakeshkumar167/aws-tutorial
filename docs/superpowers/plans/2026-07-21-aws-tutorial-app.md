# AWS Tutorial App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js + MDX tutorial site for major AWS services, with the full service catalog scaffolded as `coming-soon` and the IAM page fully authored, combining deep concept explanations with copy-paste CLI/SDK/IaC syntax.

**Architecture:** Registry-driven content site mirroring the sibling `../system-design` project. A typed catalog (`lib/catalog.ts`) defines the category → service taxonomy; a metadata registry (`lib/service-registry.ts`) holds per-service section lists; MDX files in `content/services/` hold the authored bodies. Routes resolve slug → MDX content separately from metadata. Reusable MDX components (`CodeTabs`, `Callout`, `Diagram`, `ConceptCard`) render the dual concept+syntax page template.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, MDX (`@next/mdx`), Tailwind 4 (`@tailwindcss/postcss`), lucide-react, Vitest + Testing Library, Playwright.

## Global Constraints

- Node `>=20.9.0`.
- Next.js `16.2.9`, React `19.2.7`, `@next/mdx` `16.2.9`, Tailwind `4.3.1` — match the sibling project's versions.
- TypeScript `strict` mode; path alias `@/*` → repo root.
- All source in `.ts`/`.tsx`/`.mdx`; `pageExtensions` includes `md`/`mdx`.
- Dark mode is class-based (`.dark` on `<html>`).
- SDK examples in the Hands-on tabs cover exactly four variants, in this order: **AWS CLI · TypeScript (AWS SDK v3) · Python (boto3) · CloudFormation**.
- Every catalog service is `coming-soon` EXCEPT `iam`, which is `available` and fully authored.
- Section heading `id`s inside each MDX file must exactly match the `sections[].id` values in the registry (drives the table of contents and anchors).
- Vitest test files live in `tests/**/*.test.ts(x)`; Playwright specs live in `e2e/`.
- Frequent commits: one commit per task minimum.

---

### Task 1: Project scaffold and build tooling

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tsconfig.json`
- Create: `mdx.d.ts`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`
- Create: `app/globals.css`
- Create: `app/page.tsx` (temporary placeholder, replaced in Task 6)

**Interfaces:**
- Produces: a buildable Next.js app. `npm run typecheck`, `npm run dev`, `npm run test`, `npm run build` all resolve. Path alias `@/*`. Tailwind design tokens as CSS variables (`--accent`, `--canvas`, `--surface`, `--ink`, etc.) plus `.dark` overrides.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "aws-tutorials",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "engines": {
    "node": ">=20.9.0"
  },
  "dependencies": {
    "@mdx-js/loader": "^3.1.0",
    "@mdx-js/react": "^3.1.0",
    "@next/mdx": "16.2.9",
    "lucide-react": "^0.469.0",
    "next": "16.2.9",
    "react": "19.2.7",
    "react-dom": "19.2.7"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.5",
    "@playwright/test": "1.61.0",
    "@tailwindcss/postcss": "4.3.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.18.0",
    "eslint-config-next": "16.2.9",
    "jsdom": "^25.0.1",
    "tailwindcss": "4.3.1",
    "typescript": "^5.7.0",
    "vitest": "4.1.9"
  }
}
```

- [ ] **Step 2: Create config files**

`next.config.mjs`:
```js
import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({ extension: /\.mdx?$/ });

export default withMDX(nextConfig);
```

`postcss.config.mjs`:
```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules", "e2e"]
}
```

`mdx.d.ts`:
```ts
declare module "*.mdx" {
  import type { ComponentType } from "react";
  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
```

`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

`playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } },
    },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 3: Create `app/globals.css`** (AWS-flavored tokens; accent is AWS orange)

```css
@import "tailwindcss";

/* Class-based dark mode (the `.dark` class is toggled on <html>). */
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --canvas: #fbfaf7;
  --surface: #ffffff;
  --surface-2: #f4f2ec;
  --ink: #16191f;
  --ink-muted: #545b64;
  --ink-faint: #879196;
  --border: #e6e3da;
  --border-strong: #d6d2c6;

  --accent: #ec7211;        /* AWS "console" orange */
  --accent-soft: #fdefe1;
  --accent-ink: #b4560a;

  --success: #15803d;
  --success-soft: #e7f4ec;
  --warning: #b45309;
  --warning-soft: #fbf0e1;
  --danger: #b91c1c;
  --danger-soft: #fbeaea;

  --shadow-sm: 0 1px 2px rgba(22, 25, 31, 0.05);
  --shadow-md: 0 6px 24px -12px rgba(22, 25, 31, 0.2);

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: var(--font-mono-jb), ui-monospace, "SF Mono", "Cascadia Code", monospace;
}

.dark {
  --canvas: #0d0e11;
  --surface: #15171c;
  --surface-2: #1c1f26;
  --ink: #e9eaee;
  --ink-muted: #a0a5b1;
  --ink-faint: #6f7480;
  --border: #262a33;
  --border-strong: #353a45;

  --accent: #ff9900;        /* AWS marketing orange, brighter on dark */
  --accent-soft: #2a1e0c;
  --accent-ink: #ffb84d;

  --success-soft: #10241a;
  --warning-soft: #241a0c;
  --danger-soft: #241012;
}

@theme inline {
  --color-canvas: var(--canvas);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-ink-faint: var(--ink-faint);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-accent: var(--accent);
  --color-accent-soft: var(--accent-soft);
  --color-accent-ink: var(--accent-ink);
  --color-success: var(--success);
  --color-success-soft: var(--success-soft);
  --color-warning: var(--warning);
  --color-warning-soft: var(--warning-soft);
  --color-danger: var(--danger);
  --color-danger-soft: var(--danger-soft);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
}

body {
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--font-sans);
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--surface);
  color: var(--ink);
  padding: 0.5rem 1rem;
  z-index: 50;
}
.skip-link:focus {
  left: 0.5rem;
  top: 0.5rem;
}
```

- [ ] **Step 4: Create temporary `app/page.tsx` placeholder** (replaced in Task 6, needed now so the app builds)

```tsx
export default function HomePage() {
  return <main>Scaffolding in progress.</main>;
}
```

- [ ] **Step 5: Install dependencies and verify the toolchain**

Run:
```bash
npm install
npx playwright install chromium
npm run typecheck
```
Expected: `npm install` completes; `npm run typecheck` exits 0 with no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + MDX + Tailwind toolchain"
```

---

### Task 2: Types, catalog taxonomy, and service registry (with integrity tests)

**Files:**
- Create: `lib/types.ts`
- Create: `lib/catalog.ts`
- Create: `lib/service-registry.ts`
- Test: `tests/lib/catalog.test.ts`

**Interfaces:**
- Produces:
  - `type ServiceStatus = "available" | "coming-soon"`
  - `interface ServiceSection { id: string; label: string }`
  - `interface CatalogService { slug: string; title: string; blurb: string; status: ServiceStatus }`
  - `interface ServiceCategory { slug: string; title: string; summary: string; services: readonly CatalogService[] }`
  - `interface ServiceMeta { slug: string; categorySlug: string; title: string; description: string; readingMinutes: number; concepts: readonly string[]; sections: readonly ServiceSection[] }`
  - `const catalog: readonly ServiceCategory[]`
  - `const serviceMetas: Record<string, ServiceMeta>`
  - `function getCategory(slug: string): ServiceCategory | undefined`
  - `function getServiceMeta(slug: string): ServiceMeta | undefined`
  - `function allCatalogServices(): { categorySlug: string; service: CatalogService }[]`

- [ ] **Step 1: Write the failing test** — `tests/lib/catalog.test.ts`

```ts
import { describe, it, expect } from "vitest";
import {
  catalog,
  serviceMetas,
  getCategory,
  getServiceMeta,
  allCatalogServices,
} from "@/lib/catalog";

describe("catalog integrity", () => {
  it("has no duplicate service slugs across all categories", () => {
    const slugs = allCatalogServices().map(({ service }) => service.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses only valid status values", () => {
    for (const { service } of allCatalogServices()) {
      expect(["available", "coming-soon"]).toContain(service.status);
    }
  });

  it("marks exactly one service (iam) as available", () => {
    const available = allCatalogServices().filter(
      ({ service }) => service.status === "available",
    );
    expect(available.map(({ service }) => service.slug)).toEqual(["iam"]);
  });

  it("every available service has registry metadata with a non-empty section list", () => {
    for (const { service } of allCatalogServices()) {
      if (service.status !== "available") continue;
      const meta = getServiceMeta(service.slug);
      expect(meta, `missing meta for ${service.slug}`).toBeDefined();
      expect(meta!.sections.length).toBeGreaterThan(0);
    }
  });

  it("every registry meta points at a real category and matching catalog service", () => {
    for (const meta of Object.values(serviceMetas)) {
      const category = getCategory(meta.categorySlug);
      expect(category, `bad category for ${meta.slug}`).toBeDefined();
      const inCatalog = category!.services.some((s) => s.slug === meta.slug);
      expect(inCatalog, `${meta.slug} not in its category`).toBe(true);
    }
  });

  it("getCategory returns undefined for unknown slugs", () => {
    expect(getCategory("does-not-exist")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/lib/catalog.test.ts`
Expected: FAIL — cannot resolve `@/lib/catalog`.

- [ ] **Step 3: Create `lib/types.ts`**

```ts
export type ServiceStatus = "available" | "coming-soon";

export interface ServiceSection {
  /** Matches the `id` attribute of the section's heading in the MDX. */
  id: string;
  label: string;
}

export interface CatalogService {
  /** URL-safe identifier, unique across the whole catalog. */
  slug: string;
  title: string;
  /** Short parenthetical of key sub-concepts. May be empty. */
  blurb: string;
  status: ServiceStatus;
}

export interface ServiceCategory {
  /** URL-safe identifier. */
  slug: string;
  title: string;
  /** One-sentence description of the category. */
  summary: string;
  services: readonly CatalogService[];
}

export interface ServiceMeta {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  readingMinutes: number;
  concepts: readonly string[];
  sections: readonly ServiceSection[];
}
```

- [ ] **Step 4: Create `lib/catalog.ts`** (full taxonomy; only `iam` is available)

```ts
import type { CatalogService, ServiceCategory } from "./types";
import { serviceMetas } from "./service-registry";

const soon = (slug: string, title: string, blurb = ""): CatalogService => ({
  slug,
  title,
  blurb,
  status: "coming-soon",
});

export const catalog: readonly ServiceCategory[] = [
  {
    slug: "compute",
    title: "Compute",
    summary: "Run code and workloads — from long-lived servers to event-driven functions and containers.",
    services: [
      soon("ec2", "EC2", "Instances, AMIs, auto scaling"),
      soon("lambda", "Lambda", "Serverless functions, triggers"),
      soon("ecs-fargate", "ECS / Fargate", "Containers, task definitions"),
      soon("eks", "EKS", "Managed Kubernetes"),
      soon("elastic-beanstalk", "Elastic Beanstalk", "PaaS deployments"),
    ],
  },
  {
    slug: "storage",
    title: "Storage",
    summary: "Durable object, block, file, and archival storage.",
    services: [
      soon("s3", "S3", "Buckets, storage classes, lifecycle"),
      soon("ebs", "EBS", "Block volumes"),
      soon("efs", "EFS", "Shared file storage"),
      soon("glacier", "Glacier", "Archival"),
    ],
  },
  {
    slug: "networking",
    title: "Networking & Content Delivery",
    summary: "Connect, route, and deliver traffic to your workloads.",
    services: [
      soon("vpc", "VPC", "Subnets, routing, security groups"),
      soon("route-53", "Route 53", "DNS, routing policies"),
      soon("cloudfront", "CloudFront", "CDN, edge caching"),
      soon("api-gateway", "API Gateway", "REST/HTTP APIs, throttling"),
      soon("elb", "Elastic Load Balancing", "ALB, NLB, GLB"),
    ],
  },
  {
    slug: "databases",
    title: "Databases",
    summary: "Managed relational, NoSQL, caching, and analytics data stores.",
    services: [
      soon("rds", "RDS / Aurora", "Managed relational"),
      soon("dynamodb", "DynamoDB", "NoSQL, partition keys, GSIs"),
      soon("elasticache", "ElastiCache", "Redis / Memcached"),
      soon("redshift", "Redshift", "Data warehousing"),
    ],
  },
  {
    slug: "security-identity",
    title: "Security & Identity",
    summary: "Control who can do what, and protect data and workloads.",
    services: [
      {
        slug: "iam",
        title: "IAM",
        blurb: "Users, roles, policies, evaluation",
        status: "available",
      },
      soon("cognito", "Cognito", "User pools, identity pools"),
      soon("kms", "KMS", "Key management, envelope encryption"),
      soon("secrets-manager", "Secrets Manager / Parameter Store", "Secrets, config"),
      soon("waf-shield", "WAF & Shield", "Web protection"),
    ],
  },
  {
    slug: "messaging",
    title: "Application Integration & Messaging",
    summary: "Decouple services with queues, topics, event buses, and workflows.",
    services: [
      soon("sqs", "SQS", "Queues, visibility timeout, DLQs"),
      soon("sns", "SNS", "Pub/sub, fan-out"),
      soon("eventbridge", "EventBridge", "Event bus, rules"),
      soon("step-functions", "Step Functions", "State machines"),
      soon("kinesis", "Kinesis", "Streaming"),
    ],
  },
  {
    slug: "monitoring",
    title: "Monitoring & Management",
    summary: "Observe, audit, and provision your infrastructure.",
    services: [
      soon("cloudwatch", "CloudWatch", "Metrics, logs, alarms"),
      soon("cloudtrail", "CloudTrail", "Audit logging"),
      soon("cloudformation", "CloudFormation / CDK", "Infrastructure as code"),
    ],
  },
  {
    slug: "foundations",
    title: "Cross-cutting Foundations",
    summary: "The concepts that underpin every service.",
    services: [
      soon("global-infrastructure", "Global Infrastructure", "Regions, AZs, edge"),
      soon("well-architected", "Well-Architected Framework", "Six pillars"),
      soon("shared-responsibility", "Shared Responsibility Model", ""),
      soon("pricing", "Pricing & Cost Optimization", ""),
    ],
  },
];

export function getCategory(slug: string): ServiceCategory | undefined {
  return catalog.find((category) => category.slug === slug);
}

export function getServiceMeta(slug: string): ServiceMeta | undefined {
  return serviceMetas[slug];
}

export function allCatalogServices(): { categorySlug: string; service: CatalogService }[] {
  return catalog.flatMap((category) =>
    category.services.map((service) => ({ categorySlug: category.slug, service })),
  );
}

// Re-exported so consumers can import types from one module.
export type { ServiceMeta } from "./types";
```

- [ ] **Step 5: Create `lib/service-registry.ts`** (metadata only, no MDX imports — IAM's section list)

```ts
import type { ServiceMeta } from "./types";

/**
 * Static registry of authored service tutorials, keyed by slug. Metadata only
 * (no MDX imports) so this module stays trivially unit-testable. Section `id`s
 * must match the heading ids inside the corresponding MDX file; they drive the
 * table of contents and in-page anchors.
 */
export const serviceMetas: Record<string, ServiceMeta> = {
  iam: {
    slug: "iam",
    categorySlug: "security-identity",
    title: "AWS IAM",
    description:
      "The identity and access layer everything else depends on: users, groups, roles, policies, the policy-evaluation model, and hands-on syntax for creating least-privilege roles.",
    readingMinutes: 30,
    concepts: ["Principals & roles", "Policy documents", "Policy evaluation", "Least privilege"],
    sections: [
      { id: "overview", label: "Overview" },
      { id: "core-concepts", label: "Core Concepts" },
      { id: "how-it-works", label: "How It Works" },
      { id: "hands-on", label: "Hands-on" },
      { id: "common-patterns", label: "Common Patterns" },
      { id: "pitfalls-best-practices", label: "Pitfalls & Best Practices" },
      { id: "pricing-limits", label: "Pricing & Limits" },
      { id: "knowledge-checks", label: "Knowledge Checks & FAQ" },
    ],
  },
};
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test -- tests/lib/catalog.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 7: Commit**

```bash
git add lib/ tests/lib/catalog.test.ts
git commit -m "feat: add typed catalog taxonomy and service registry"
```

---

### Task 3: Reusable MDX components

**Files:**
- Create: `components/learning/callout.tsx`
- Create: `components/learning/concept-card.tsx`
- Create: `components/learning/diagram.tsx`
- Create: `components/learning/code-tabs.tsx`
- Create: `mdx-components.tsx`
- Test: `tests/components/code-tabs.test.tsx`

**Interfaces:**
- Consumes: nothing from prior tasks (pure presentational components).
- Produces:
  - `Callout({ variant?: "info"|"warning"|"tip"; title?: string; children })`
  - `ConceptCard({ term: string; children })`
  - `Diagram({ caption?: string; children })`
  - `CodeTab` type: `{ label: string; language: string; code: string }` and `CodeTabs({ tabs: CodeTab[] })` — a client component that switches between variants.
  - `useMDXComponents(components)` in `mdx-components.tsx` wiring all four plus base elements so MDX files can use them without imports.

- [ ] **Step 1: Write the failing test** — `tests/components/code-tabs.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeTabs } from "@/components/learning/code-tabs";

const tabs = [
  { label: "AWS CLI", language: "bash", code: "aws iam create-role" },
  { label: "TypeScript", language: "ts", code: "new IAMClient({})" },
];

describe("CodeTabs", () => {
  it("shows the first tab's code by default", () => {
    render(<CodeTabs tabs={tabs} />);
    expect(screen.getByText("aws iam create-role")).toBeInTheDocument();
    expect(screen.queryByText("new IAMClient({})")).not.toBeInTheDocument();
  });

  it("switches code when another tab is clicked", async () => {
    const user = userEvent.setup();
    render(<CodeTabs tabs={tabs} />);
    await user.click(screen.getByRole("tab", { name: "TypeScript" }));
    expect(screen.getByText("new IAMClient({})")).toBeInTheDocument();
    expect(screen.queryByText("aws iam create-role")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Add the `@testing-library/user-event` dev dependency and run the test to verify it fails**

Run:
```bash
npm install -D @testing-library/user-event@^14.5.2
npm run test -- tests/components/code-tabs.test.tsx
```
Expected: FAIL — cannot resolve `@/components/learning/code-tabs`.

- [ ] **Step 3: Create `components/learning/code-tabs.tsx`**

```tsx
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

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-border bg-surface-2">
      <div role="tablist" aria-label="Code variants" className="flex flex-wrap gap-1 border-b border-border bg-surface px-2 pt-2">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            role="tab"
            aria-selected={i === active}
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
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code data-language={current.language} className="font-mono">
          {current.code}
        </code>
      </pre>
    </div>
  );
}
```

- [ ] **Step 4: Run the CodeTabs test to verify it passes**

Run: `npm run test -- tests/components/code-tabs.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Create `components/learning/callout.tsx`**

```tsx
import { Info, AlertTriangle, Lightbulb } from "lucide-react";

type Variant = "info" | "warning" | "tip";

const config: Record<Variant, { icon: typeof Info; label: string; className: string; iconClass: string }> = {
  info: { icon: Info, label: "Note", className: "border-accent/30 bg-accent-soft", iconClass: "text-accent" },
  warning: { icon: AlertTriangle, label: "Watch out", className: "border-warning/40 bg-warning-soft", iconClass: "text-warning" },
  tip: { icon: Lightbulb, label: "Tip", className: "border-success/40 bg-success-soft", iconClass: "text-success" },
};

export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  const { icon: Icon, label, className, iconClass } = config[variant];
  return (
    <aside className={`not-prose my-6 rounded-xl border p-5 ${className}`}>
      <div className="mb-2 flex items-center gap-2">
        <Icon size={16} aria-hidden className={iconClass} />
        <span className="text-sm font-semibold text-ink">{title ?? label}</span>
      </div>
      <div className="text-sm leading-relaxed text-ink-muted [&_a]:text-accent-ink [&_a]:underline">
        {children}
      </div>
    </aside>
  );
}
```

- [ ] **Step 6: Create `components/learning/concept-card.tsx`**

```tsx
export function ConceptCard({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="not-prose rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
      <div className="mb-1 text-sm font-semibold text-accent-ink">{term}</div>
      <div className="text-sm leading-relaxed text-ink-muted">{children}</div>
    </div>
  );
}
```

- [ ] **Step 7: Create `components/learning/diagram.tsx`**

```tsx
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
```

- [ ] **Step 8: Create `mdx-components.tsx`** (wires components into MDX + styles base elements)

```tsx
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
```

- [ ] **Step 9: Run the full unit suite and typecheck**

Run:
```bash
npm run test
npm run typecheck
```
Expected: all tests PASS; typecheck exits 0.

- [ ] **Step 10: Commit**

```bash
git add components/learning mdx-components.tsx tests/components package.json package-lock.json
git commit -m "feat: add reusable MDX components (CodeTabs, Callout, ConceptCard, Diagram)"
```

---

### Task 4: App shell — layout, header, footer, theme toggle

**Files:**
- Create: `components/shell/site-header.tsx`
- Create: `components/shell/site-footer.tsx`
- Create: `components/shell/theme-toggle.tsx`
- Create: `app/layout.tsx`

**Interfaces:**
- Consumes: `app/globals.css` (Task 1), the `.dark` class convention.
- Produces: `SiteHeader`, `SiteFooter`, `ThemeToggle` React components; a root layout that loads Inter + JetBrains Mono fonts, applies the pre-hydration theme script, and renders header/main/footer.

- [ ] **Step 1: Create `components/shell/theme-toggle.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-md border border-border p-2 text-ink-muted hover:text-ink"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
```

- [ ] **Step 2: Create `components/shell/site-header.tsx`**

```tsx
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="rounded bg-accent px-1.5 py-0.5 text-sm text-white">AWS</span>
          <span>Tutorials</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/services" className="text-ink-muted hover:text-ink">
            Services
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create `components/shell/site-footer.tsx`**

```tsx
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-faint">
        A learning companion for the most-used AWS services. Not affiliated with Amazon Web Services.
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Create `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "AWS Tutorials",
    template: "%s · AWS Tutorials",
  },
  description:
    "Learn the most-used AWS services the way engineers actually use them — deep concept explanations paired with copy-paste CLI, SDK, and CloudFormation syntax.",
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored || (prefersDark ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main id="main-content" className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify the app builds**

Run: `npm run build`
Expected: build succeeds (the temporary `app/page.tsx` from Task 1 still renders).

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx components/shell
git commit -m "feat: add app shell with header, footer, and theme toggle"
```

---

### Task 5: Service catalog components and pages (home + /services)

**Files:**
- Create: `components/catalog/service-card.tsx`
- Create: `components/catalog/category-section.tsx`
- Create: `app/page.tsx` (replaces the Task 1 placeholder)
- Create: `app/services/page.tsx`
- Test: `tests/components/service-card.test.tsx`

**Interfaces:**
- Consumes: `catalog`, `ServiceCategory`, `CatalogService` from `@/lib/catalog` (Task 2).
- Produces:
  - `ServiceCard({ categorySlug, service })` — links to `/services/[slug]` only when `status === "available"`; otherwise renders a non-link "Coming soon" card.
  - `CategorySection({ category })` — heading + grid of `ServiceCard`s.
  - Home page (`/`) with hero + all categories; `/services` catalog page.

- [ ] **Step 1: Write the failing test** — `tests/components/service-card.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ServiceCard } from "@/components/catalog/service-card";

describe("ServiceCard", () => {
  it("links to the service page when available", () => {
    render(
      <ServiceCard
        categorySlug="security-identity"
        service={{ slug: "iam", title: "IAM", blurb: "Roles & policies", status: "available" }}
      />,
    );
    const link = screen.getByRole("link", { name: /IAM/ });
    expect(link).toHaveAttribute("href", "/services/iam");
  });

  it("renders a non-link coming-soon card when not available", () => {
    render(
      <ServiceCard
        categorySlug="compute"
        service={{ slug: "ec2", title: "EC2", blurb: "Instances", status: "coming-soon" }}
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/components/service-card.test.tsx`
Expected: FAIL — cannot resolve `@/components/catalog/service-card`.

- [ ] **Step 3: Create `components/catalog/service-card.tsx`**

```tsx
import Link from "next/link";
import type { CatalogService } from "@/lib/types";

export function ServiceCard({
  service,
}: {
  categorySlug: string;
  service: CatalogService;
}) {
  const available = service.status === "available";

  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-ink">{service.title}</span>
        {available ? (
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
            Available
          </span>
        ) : (
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-faint">
            Coming soon
          </span>
        )}
      </div>
      {service.blurb ? (
        <p className="mt-1 text-sm text-ink-muted">{service.blurb}</p>
      ) : null}
    </>
  );

  const className =
    "block rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] transition";

  if (available) {
    return (
      <Link href={`/services/${service.slug}`} className={`${className} hover:border-accent hover:shadow-[var(--shadow-md)]`}>
        {inner}
      </Link>
    );
  }
  return <div className={`${className} opacity-70`}>{inner}</div>;
}
```

- [ ] **Step 4: Run the ServiceCard test to verify it passes**

Run: `npm run test -- tests/components/service-card.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Create `components/catalog/category-section.tsx`**

```tsx
import type { ServiceCategory } from "@/lib/types";
import { ServiceCard } from "./service-card";

export function CategorySection({ category }: { category: ServiceCategory }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-ink">{category.title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">{category.summary}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {category.services.map((service) => (
          <ServiceCard key={service.slug} categorySlug={category.slug} service={service} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create `app/page.tsx`** (replaces the placeholder)

```tsx
import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { CategorySection } from "@/components/catalog/category-section";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Learn AWS the way engineers use it
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          Deep explanations of the most-used AWS services, each paired with copy-paste
          syntax for the AWS CLI, TypeScript and Python SDKs, and CloudFormation.
        </p>
        <Link
          href="/services/iam"
          className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent-ink"
        >
          Start with IAM →
        </Link>
      </section>

      {catalog.map((category) => (
        <CategorySection key={category.slug} category={category} />
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Create `app/services/page.tsx`**

```tsx
import type { Metadata } from "next";
import { catalog } from "@/lib/catalog";
import { CategorySection } from "@/components/catalog/category-section";

export const metadata: Metadata = {
  title: "Services",
  description: "Browse the full AWS service catalog by category.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">AWS Service Catalog</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">
        Every major service, grouped by category. Available pages are fully authored; the
        rest are on the way.
      </p>
      {catalog.map((category) => (
        <CategorySection key={category.slug} category={category} />
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Verify build and tests**

Run:
```bash
npm run test
npm run build
```
Expected: tests PASS; build succeeds.

- [ ] **Step 9: Commit**

```bash
git add app/page.tsx app/services components/catalog tests/components/service-card.test.tsx
git commit -m "feat: add home and services catalog pages"
```

---

### Task 6: Service tutorial route with table of contents

**Files:**
- Create: `components/service/table-of-contents.tsx`
- Create: `components/service/service-layout.tsx`
- Create: `app/services/[slug]/page.tsx`
- Create: `app/services/[slug]/not-found.tsx`

**Interfaces:**
- Consumes: `getServiceMeta`, `getCategory` from `@/lib/catalog`; `ServiceMeta` type; the compiled IAM MDX (imported in the route). Note: the IAM MDX file is authored in Task 7 — create a minimal placeholder `content/services/iam.mdx` in this task's Step 1 so the route compiles, then Task 7 replaces its body.
- Produces:
  - `TableOfContents({ sections })` — sticky nav listing section anchors.
  - `ServiceLayout({ meta, categoryTitle, children })` — two-column layout (content + sticky TOC), header with title/description/reading time/concepts.
  - Route resolving `/services/[slug]` → MDX content, `generateStaticParams`, `generateMetadata`, and a `not-found` page.

- [ ] **Step 1: Create a minimal placeholder `content/services/iam.mdx`** (body replaced in Task 7)

```mdx
<h2 id="overview">Overview</h2>

Placeholder — full content authored in the next task.

<h2 id="core-concepts">Core Concepts</h2>

Placeholder.

<h2 id="how-it-works">How It Works</h2>

Placeholder.

<h2 id="hands-on">Hands-on</h2>

Placeholder.

<h2 id="common-patterns">Common Patterns</h2>

Placeholder.

<h2 id="pitfalls-best-practices">Pitfalls & Best Practices</h2>

Placeholder.

<h2 id="pricing-limits">Pricing & Limits</h2>

Placeholder.

<h2 id="knowledge-checks">Knowledge Checks & FAQ</h2>

Placeholder.
```

- [ ] **Step 2: Create `components/service/table-of-contents.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `components/service/service-layout.tsx`**

```tsx
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
```

- [ ] **Step 4: Create `app/services/[slug]/not-found.tsx`**

```tsx
import Link from "next/link";

export default function ServiceNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-ink">Service not found</h1>
      <p className="mt-2 text-ink-muted">This tutorial doesn’t exist yet or is still coming soon.</p>
      <Link href="/services" className="mt-6 inline-block text-accent-ink underline">
        Browse the catalog →
      </Link>
    </div>
  );
}
```

- [ ] **Step 5: Create `app/services/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { getServiceMeta, getCategory } from "@/lib/catalog";
import { serviceMetas } from "@/lib/service-registry";
import { ServiceLayout } from "@/components/service/service-layout";
import IamContent from "@/content/services/iam.mdx";

/** Maps each authored service slug to its compiled MDX content component. */
const content: Record<string, ComponentType> = {
  iam: IamContent,
};

export function generateStaticParams() {
  return Object.values(serviceMetas).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getServiceMeta(slug);
  if (!meta) return { title: "Service not found" };
  return { title: meta.title, description: meta.description };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getServiceMeta(slug);
  const Content = content[slug];
  if (!meta || !Content) notFound();
  const category = getCategory(meta.categorySlug);

  return (
    <ServiceLayout meta={meta} categoryTitle={category?.title ?? meta.categorySlug}>
      <Content />
    </ServiceLayout>
  );
}
```

- [ ] **Step 6: Verify build and run the app manually**

Run:
```bash
npm run build
```
Expected: build succeeds; `/services/iam` is in the static route output. Optionally `npm run dev` and visit `http://localhost:3000/services/iam` — the placeholder page renders with the TOC listing all 8 sections.

- [ ] **Step 7: Commit**

```bash
git add app/services/\[slug\] components/service content/services/iam.mdx
git commit -m "feat: add service tutorial route with table of contents"
```

---

### Task 7: Author the IAM tutorial content

**Files:**
- Modify: `content/services/iam.mdx` (replace the placeholder body from Task 6 with full content)

**Interfaces:**
- Consumes: MDX components `Callout`, `ConceptCard`, `Diagram`, `CodeTabs` (available in MDX via `mdx-components.tsx`, Task 3). Section heading `id`s MUST match the registry (Task 2): `overview`, `core-concepts`, `how-it-works`, `hands-on`, `common-patterns`, `pitfalls-best-practices`, `pricing-limits`, `knowledge-checks`.
- Produces: the fully authored IAM page body.

- [ ] **Step 1: Replace `content/services/iam.mdx` with the full authored content**

Write real, technically accurate prose in each section. Use this exact structure (the eight headings with the ids below are required; expand the prose so each section is substantive — a few paragraphs — and keep every claim accurate):

```mdx
<h2 id="overview">Overview</h2>

AWS Identity and Access Management (IAM) is the control plane for **who can do
what** in an AWS account. Every request to an AWS API — from the console, the
CLI, an SDK, or another service — is authenticated to a *principal* and then
authorized against IAM policies before it is allowed to run. IAM is a **global**
service (not region-scoped) and is **free**: you pay for the resources your
identities use, not for IAM itself.

The single most important habit IAM teaches is **least privilege**: grant only
the permissions a principal actually needs, and prefer short-lived credentials
(roles) over long-lived ones (access keys).

<Callout variant="warning" title="Protect the root user">
The account **root user** can do anything and cannot be restricted by IAM
policies. Never use it for day-to-day work, enable MFA on it, and create
individual IAM identities (or better, federated identities) instead.
</Callout>

<h2 id="core-concepts">Core Concepts</h2>

<div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
  <ConceptCard term="Principal">An entity that makes a request — an IAM user, an assumed role session, or an AWS service acting on your behalf.</ConceptCard>
  <ConceptCard term="User / Group">A long-lived identity for a human or app; groups bundle users so policies attach once.</ConceptCard>
  <ConceptCard term="Role">An identity with no long-term credentials that principals *assume* to get temporary credentials via STS.</ConceptCard>
  <ConceptCard term="Policy">A JSON document of permission statements (Effect, Action, Resource, Condition) attached to identities or resources.</ConceptCard>
</div>

Policies come in several kinds: **identity-based** (attached to users/roles),
**resource-based** (attached to a resource such as an S3 bucket or SQS queue and
naming a principal), **permissions boundaries** (a ceiling on what an identity
*can* be granted), and **Service Control Policies** (org-wide guardrails). Every
resource and principal is named by an **ARN**
(`arn:aws:service:region:account-id:resource`).

<Diagram caption="How the IAM pieces relate">
  <pre className="font-mono text-xs">{`Principal ──assumes──▶ Role ──has──▶ Policies ──allow/deny──▶ Actions on Resources
   │                                    ▲
   └── User/Group ──attaches───────────┘`}</pre>
</Diagram>

<h2 id="how-it-works">How It Works</h2>

When a principal calls an AWS API, IAM evaluates **all** applicable policies and
reduces them to a single allow/deny using this logic:

1. Start from an implicit **deny** (nothing is allowed by default).
2. If **any** applicable policy has an explicit **Deny** that matches, the
   request is denied — an explicit deny always wins.
3. Otherwise, the request is allowed only if **some** policy has an explicit
   **Allow** that matches the action, resource, and conditions.
4. If neither matches, the implicit deny stands.

Additional gates apply for organizations (SCPs), permissions boundaries, and
session policies — the effective permission is the **intersection** of all of
them. This is why an `Allow` alone isn't always enough: a boundary or SCP can
still block it.

<Callout variant="info" title="Explicit deny beats everything">
Order of precedence: **explicit Deny → explicit Allow → implicit Deny**. Use
explicit denies sparingly but decisively for guardrails you never want bypassed.
</Callout>

<h2 id="hands-on">Hands-on</h2>

The task below creates an IAM **role** that a Lambda function can assume, then
attaches a **least-privilege policy** granting read-only access to one S3
bucket. The same task is shown across the AWS CLI, the AWS SDK for JavaScript v3
(TypeScript), the AWS SDK for Python (boto3), and CloudFormation.

<CodeTabs tabs={[
  {
    label: "AWS CLI",
    language: "bash",
    code: `# 1. Create the role with a trust policy allowing Lambda to assume it
aws iam create-role \\
  --role-name demo-reader \\
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }]
  }'

# 2. Attach a least-privilege inline policy: read one bucket only
aws iam put-role-policy \\
  --role-name demo-reader \\
  --policy-name read-demo-bucket \\
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::demo-bucket/*"
    }]
  }'`
  },
  {
    label: "TypeScript (SDK v3)",
    language: "ts",
    code: `import {
  IAMClient,
  CreateRoleCommand,
  PutRolePolicyCommand,
} from "@aws-sdk/client-iam";

const iam = new IAMClient({ region: "us-east-1" });

const trustPolicy = {
  Version: "2012-10-17",
  Statement: [{
    Effect: "Allow",
    Principal: { Service: "lambda.amazonaws.com" },
    Action: "sts:AssumeRole",
  }],
};

const permissionPolicy = {
  Version: "2012-10-17",
  Statement: [{
    Effect: "Allow",
    Action: ["s3:GetObject"],
    Resource: "arn:aws:s3:::demo-bucket/*",
  }],
};

await iam.send(new CreateRoleCommand({
  RoleName: "demo-reader",
  AssumeRolePolicyDocument: JSON.stringify(trustPolicy),
}));

await iam.send(new PutRolePolicyCommand({
  RoleName: "demo-reader",
  PolicyName: "read-demo-bucket",
  PolicyDocument: JSON.stringify(permissionPolicy),
}));`
  },
  {
    label: "Python (boto3)",
    language: "python",
    code: `import json
import boto3

iam = boto3.client("iam")

trust_policy = {
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Principal": {"Service": "lambda.amazonaws.com"},
        "Action": "sts:AssumeRole",
    }],
}

permission_policy = {
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Action": ["s3:GetObject"],
        "Resource": "arn:aws:s3:::demo-bucket/*",
    }],
}

iam.create_role(
    RoleName="demo-reader",
    AssumeRolePolicyDocument=json.dumps(trust_policy),
)

iam.put_role_policy(
    RoleName="demo-reader",
    PolicyName="read-demo-bucket",
    PolicyDocument=json.dumps(permission_policy),
)`
  },
  {
    label: "CloudFormation",
    language: "yaml",
    code: `Resources:
  DemoReaderRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: demo-reader
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      Policies:
        - PolicyName: read-demo-bucket
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow
                Action: [s3:GetObject]
                Resource: arn:aws:s3:::demo-bucket/*`
  }
]} />

<h2 id="common-patterns">Common Patterns</h2>

- **Service roles.** Give an AWS service (Lambda, EC2, ECS task) a role whose
  trust policy names that service. The service receives temporary credentials
  automatically — no keys to manage.
- **Cross-account access.** Let account B assume a role in account A: A's role
  trust policy names B's account/role as the principal, and the caller runs
  `sts:AssumeRole`. Add an `ExternalId` condition to defend against the
  confused-deputy problem.
- **Least-privilege policies.** Start from the specific actions and resource
  ARNs you need, then widen only when a real call fails. Use IAM Access Analyzer
  to generate policies from observed CloudTrail activity.

<h2 id="pitfalls-best-practices">Pitfalls & Best Practices</h2>

- **Avoid wildcards** like `"Action": "*"` or `"Resource": "*"` except where
  genuinely required; they are the most common source of over-permissioning.
- **Prefer roles over access keys.** Long-lived access keys leak and rarely get
  rotated; roles hand out short-lived credentials automatically.
- **Scope with conditions** (`aws:SourceArn`, `aws:PrincipalOrgID`, `ExternalId`)
  to prevent confused-deputy and cross-tenant access.
- **Turn on MFA**, rotate any remaining credentials, and review access with IAM
  Access Analyzer and CloudTrail.

<h2 id="pricing-limits">Pricing & Limits</h2>

IAM itself is **free** — there is no charge for users, roles, groups, or
policies. You pay only for the AWS resources your principals use. Be aware of
soft limits (raiseable via Service Quotas): a default of 5,000 users and 1,000
roles per account, up to 10 managed policies attached per identity, and a
6,144-character size limit on a managed policy document. STS temporary
credentials last from 15 minutes up to a role's configured maximum (up to 12
hours).

<h2 id="knowledge-checks">Knowledge Checks & FAQ</h2>

**What wins, an explicit allow or an explicit deny?** An explicit **deny**
always wins. Evaluation is: explicit deny → explicit allow → implicit deny.

**When should I use a role instead of a user?** Whenever the workload can obtain
credentials by assuming a role — AWS services, cross-account access, and
federated humans should all use roles. Reserve IAM users for the rare cases that
genuinely need long-lived keys.

**Is IAM regional?** No. IAM is global; identities and policies are the same
across all regions.

**What's the difference between identity-based and resource-based policies?**
Identity-based policies attach to a principal and say what it may do;
resource-based policies attach to a resource and say which principals may act on
it. A cross-account call typically needs an allow on *both* sides.
```

- [ ] **Step 2: Verify build and static generation**

Run: `npm run build`
Expected: build succeeds; `/services/iam` renders with all four code tabs and no MDX compile errors.

- [ ] **Step 3: Run the full unit suite and typecheck**

Run:
```bash
npm run test
npm run typecheck
```
Expected: all PASS; typecheck exits 0.

- [ ] **Step 4: Commit**

```bash
git add content/services/iam.mdx
git commit -m "feat: author the IAM tutorial content"
```

---

### Task 8: End-to-end smoke test

**Files:**
- Create: `e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: the running production build served by Playwright's `webServer` (Task 1 config, port 3100).
- Produces: an e2e spec verifying the home catalog and the IAM page.

- [ ] **Step 1: Write the failing test** — `e2e/smoke.spec.ts`

```ts
import { test, expect } from "@playwright/test";

test("home page renders the catalog with the IAM link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /IAM/ }).first()).toBeVisible();
});

test("IAM page renders its table of contents and code tabs", async ({ page }) => {
  await page.goto("/services/iam");
  await expect(page.getByRole("heading", { name: "AWS IAM", level: 1 })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "On this page" })).toBeVisible();

  // The Hands-on CodeTabs switcher exposes tabs; clicking one swaps the code.
  await expect(page.getByRole("tab", { name: "AWS CLI" })).toBeVisible();
  await page.getByRole("tab", { name: "Python (boto3)" }).click();
  await expect(page.getByText("import boto3")).toBeVisible();
});

test("unknown service slug shows the not-found page", async ({ page }) => {
  const res = await page.goto("/services/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByText(/service not found/i)).toBeVisible();
});
```

- [ ] **Step 2: Run the e2e suite to verify it passes**

Run: `npm run test:e2e`
Expected: Playwright builds/starts the app on port 3100 and all three tests PASS. (If chromium isn't installed, run `npx playwright install chromium` first.)

- [ ] **Step 3: Commit**

```bash
git add e2e/smoke.spec.ts
git commit -m "test: add e2e smoke tests for home and IAM pages"
```

---

## Self-Review Notes

- **Spec coverage:** Stack (Task 1) · IA home/catalog/service/not-found (Tasks 5–6) · full catalog scaffolded coming-soon + IAM available (Task 2) · dual 8-section template with 4-variant CodeTabs (Tasks 3, 7) · reusable components CodeTabs/Callout/Diagram/ConceptCard (Task 3) · unit tests for registry integrity + e2e smoke (Tasks 2, 8). All spec sections map to a task.
- **CodeTabs tab label** `"Python (boto3)"` is used identically in Task 7 (MDX) and Task 8 (e2e selector); `"AWS CLI"` matches Task 3's test and Task 8.
- **Section ids** in Task 2 registry (`overview`, `core-concepts`, `how-it-works`, `hands-on`, `common-patterns`, `pitfalls-best-practices`, `pricing-limits`, `knowledge-checks`) match the MDX headings in Tasks 6 and 7 exactly.
- **Type names** consistent across tasks: `ServiceMeta`, `ServiceCategory`, `CatalogService`, `ServiceSection`, `ServiceStatus`; functions `getCategory`, `getServiceMeta`, `allCatalogServices`.
