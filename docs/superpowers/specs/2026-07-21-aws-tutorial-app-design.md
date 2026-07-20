# AWS Tutorial App — Design

**Date:** 2026-07-21
**Status:** Approved (design), pending implementation plan

## Goal

A tutorial site that teaches the major, most-used AWS services and concepts,
combining **hands-on developer learning** (copy-paste CLI/SDK/IaC syntax) with
**deep concept mastery** (architecture, evaluation flows, tradeoffs). It is a
sibling to the existing `../system-design` project and mirrors its stack and
registry-driven structure.

Non-goals: certification "brain-dump" question banks; provisioning real AWS
resources; account/billing integration; interactive AWS API calls.

## Stack & architecture

Mirror the `system-design` project so the two feel like siblings:

- **Next.js 16** (App Router), **React 19**, TypeScript.
- **MDX** for content (`@next/mdx`, `@mdx-js/react`).
- **Tailwind 4** (`@tailwindcss/postcss`).
- **lucide-react** for icons.
- **Vitest** for unit tests (registry/catalog logic).
- **Playwright** for a small number of e2e smoke tests.
- Node `>=20.9.0`.

Content/metadata split (same as reference):

- `content/services/*.mdx` — the authored tutorial bodies.
- `lib/service-registry.ts` — typed metadata per service (slug, title,
  description, category, difficulty, reading minutes, section list, status).
  Metadata only, no MDX imports, so it stays trivially unit-testable.
- `lib/catalog.ts` — the category taxonomy (ordered categories → services),
  parallel to the reference's `topics.ts`.
- `lib/types.ts` — shared types (`ServiceMeta`, `ServiceCategory`,
  `ServiceStatus`, `ServiceSection`).
- Route resolves slug → MDX content separately from the registry.

## Information architecture

- **Home** (`/`) — hero + full service catalog grouped by category, each card
  showing an `available` / `coming-soon` badge.
- **Catalog** (`/services`) — browsable grid of all services by category.
- **Service page** (`/services/[slug]`) — the tutorial, with a sticky table of
  contents driven by the registry's section list (heading `id`s in the MDX must
  match the section `id`s in the registry).
- **not-found** for unknown slugs.

### Categories (taxonomy)

Compute, Storage, Networking & Content Delivery, Databases, Security &
Identity, Application Integration / Messaging, Monitoring & Management,
Cross-cutting concepts.

Every service from the catalog below is scaffolded as a `coming-soon` entry.
**IAM is the single fully-authored page in the first pass.**

Initial catalog contents (status in parens):

- **Compute:** EC2, Lambda, ECS/Fargate, EKS, Elastic Beanstalk — all coming-soon
- **Storage:** S3, EBS, EFS, Glacier — all coming-soon
- **Networking:** VPC, Route 53, CloudFront, API Gateway, ELB — all coming-soon
- **Databases:** RDS/Aurora, DynamoDB, ElastiCache, Redshift — all coming-soon
- **Security & Identity:** **IAM (available)**, Cognito, KMS,
  Secrets Manager / Parameter Store, WAF & Shield — rest coming-soon
- **Messaging:** SQS, SNS, EventBridge, Step Functions, Kinesis — all coming-soon
- **Monitoring & Management:** CloudWatch, CloudTrail, CloudFormation/CDK — all coming-soon
- **Cross-cutting:** Global infrastructure (Regions/AZs), Well-Architected
  Framework, Shared Responsibility Model, Pricing & cost optimization — all coming-soon

## The dual page template

Every authored service page follows a fixed 8-section spine. Each section
carries **both** conceptual explanation and copy-paste syntax where relevant:

1. **Overview** — what it is, when to reach for it, mental model.
2. **Core concepts** — vocabulary + a diagram (IAM: users, groups, roles,
   policies, principals, the policy-evaluation model).
3. **How it works** — request/evaluation flow, tradeoffs.
4. **Hands-on** — tabbed code blocks running the *same* task across:
   **AWS CLI · TypeScript (AWS SDK v3) · Python (boto3) · CloudFormation**.
5. **Common patterns** — real recipes (IAM: least-privilege policy,
   cross-account role assumption, role-for-service).
6. **Pitfalls & best practices**.
7. **Pricing / limits notes** (where relevant; IAM itself is free — note that).
8. **Knowledge checks / FAQ**.

Section `id`s in each MDX file must match the registry so the TOC and anchors
work.

## Reusable MDX components

Built once, used across all future authored pages:

- **`CodeTabs`** — switches between CLI / TypeScript / Python / CloudFormation
  variants of the same task. Client component; remembers selected tab per page.
- **`Callout`** — `note` / `warning` / `tip` variants with an icon.
- **`Diagram`** — a wrapper for an inline SVG/figure with a caption.
- **`ConceptCard`** — a labeled definition card for the Core concepts section.

These register through `mdx-components.tsx`, same mechanism as the reference.

## IAM page content outline (first authored page)

- **Overview:** identity vs. resource control; IAM is global, free; the
  root-user warning.
- **Core concepts:** principals, users, groups, roles, policies (identity vs.
  resource vs. permission boundaries vs. SCPs), ARNs. Diagram of the pieces.
- **How it works:** the policy evaluation logic — explicit deny > allow >
  implicit deny; how a request is authorized.
- **Hands-on (CodeTabs):** create a role and attach a least-privilege policy;
  same task in CLI, SDK v3, boto3, CloudFormation.
- **Common patterns:** least-privilege S3 read policy; cross-account
  `sts:AssumeRole`; service role for Lambda.
- **Pitfalls:** wildcards in `Action`/`Resource`, long-lived access keys vs.
  roles, confused-deputy, not using conditions.
- **Best practices:** roles over keys, MFA, access analyzer, rotate credentials.
- **Knowledge checks / FAQ.**

## Testing

Keep it light — this is a content site.

- **Unit (Vitest):** catalog/registry integrity — every catalog service resolves
  to registry metadata; no duplicate slugs; `available` services have a section
  list; status values are valid.
- **E2e (Playwright):** home page renders the catalog; the IAM page renders with
  its table of contents and at least one `CodeTabs` block.

## Out of scope (YAGNI)

Search, auth, dark-mode toggle beyond what Tailwind gives cheaply, comments,
per-user progress tracking, live AWS calls, diagrams tooling beyond inline SVG.
Add later only if needed.
