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
