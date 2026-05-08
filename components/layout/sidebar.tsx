"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS } from "@/components/layout/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] w-72 flex-col rounded-3xl p-4 lg:flex">
      <div className="mb-6 space-y-2">
        <Badge variant="primary">Embodied Research OS</Badge>
        <h1 className="font-title text-xl font-semibold text-slate-100">Neural Learning Cockpit</h1>
        <p className="text-xs text-slate-400">
          Paper -&gt; Concept -&gt; Question -&gt; Review -&gt; Interview Readiness
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-slate-300 transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-slate-100",
                active && "border-primary/45 bg-primary/15 text-slate-100 shadow-glow"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3">
        <p className="text-xs font-semibold text-slate-200">Daily Focus</p>
        <p className="mt-1 text-xs text-slate-400">
          Deep read 1 Must Read paper, complete 8 due reviews, run one mock interview round.
        </p>
      </div>
    </aside>
  );
}
