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
