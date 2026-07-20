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
