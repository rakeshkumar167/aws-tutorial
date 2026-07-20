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
