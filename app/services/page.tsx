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
