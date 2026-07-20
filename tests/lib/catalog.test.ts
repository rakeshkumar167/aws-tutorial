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
