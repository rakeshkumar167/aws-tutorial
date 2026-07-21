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
  vpc: {
    slug: "vpc",
    categorySlug: "networking",
    title: "Amazon VPC",
    description:
      "Your isolated network in AWS: CIDR blocks, public and private subnets, route tables, internet and NAT gateways, security groups vs. network ACLs, and hands-on syntax for building a two-tier VPC.",
    readingMinutes: 25,
    concepts: ["CIDR & subnets", "Route tables & gateways", "Security groups vs. NACLs", "Public/private tiers"],
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
