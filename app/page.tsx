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
