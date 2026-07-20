import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="rounded bg-accent px-1.5 py-0.5 text-sm text-white">AWS</span>
          <span>Tutorials</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/services" className="text-ink-muted hover:text-ink">
            Services
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
