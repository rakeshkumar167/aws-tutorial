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
