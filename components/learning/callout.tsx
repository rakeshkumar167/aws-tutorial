import { Info, AlertTriangle, Lightbulb } from "lucide-react";

type Variant = "info" | "warning" | "tip";

const config: Record<Variant, { icon: typeof Info; label: string; className: string; iconClass: string }> = {
  info: { icon: Info, label: "Note", className: "border-accent/30 bg-accent-soft", iconClass: "text-accent" },
  warning: { icon: AlertTriangle, label: "Watch out", className: "border-warning/40 bg-warning-soft", iconClass: "text-warning" },
  tip: { icon: Lightbulb, label: "Tip", className: "border-success/40 bg-success-soft", iconClass: "text-success" },
};

export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  const { icon: Icon, label, className, iconClass } = config[variant];
  return (
    <aside className={`not-prose my-6 rounded-xl border p-5 ${className}`}>
      <div className="mb-2 flex items-center gap-2">
        <Icon size={16} aria-hidden className={iconClass} />
        <span className="text-sm font-semibold text-ink">{title ?? label}</span>
      </div>
      <div className="text-sm leading-relaxed text-ink-muted [&_a]:text-accent-ink [&_a]:underline">
        {children}
      </div>
    </aside>
  );
}
