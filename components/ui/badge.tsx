import * as React from "react";

import { cn } from "@/lib/utils/cn";

const variants: Record<string, string> = {
  primary: "bg-primary/20 text-primary border-primary/35",
  secondary: "bg-secondary/20 text-secondary border-secondary/35",
  success: "bg-success/20 text-success border-success/35",
  warning: "bg-warning/20 text-warning border-warning/35",
  danger: "bg-danger/20 text-danger border-danger/35",
  muted: "bg-white/8 text-slate-300 border-white/20"
};

export function Badge({
  className,
  variant = "muted",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof variants }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-1 text-[11px] font-medium uppercase tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
