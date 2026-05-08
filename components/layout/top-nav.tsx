"use client";

import { Command, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="glass sticky top-4 z-20 mb-4 flex h-16 items-center justify-between rounded-2xl px-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Embodied Research OS</p>
        <h2 className="text-sm font-semibold text-slate-100">Personal Research & Interview Cockpit</h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="hidden items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:border-primary/45 hover:bg-primary/10 md:flex"
          type="button"
          onClick={() => {
            const event = new KeyboardEvent("keydown", {
              key: "k",
              ctrlKey: true,
              bubbles: true
            });
            window.dispatchEvent(event);
          }}
        >
          <Search className="h-3.5 w-3.5" />
          Command Palette
          <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-slate-400">
            <Command className="mr-0.5 inline h-3 w-3" />K
          </span>
        </button>

        <Button variant="secondary" size="sm" asChild>
          <Link href="/papers?focus=import">Import Paper</Link>
        </Button>
      </div>
    </header>
  );
}
