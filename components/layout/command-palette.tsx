"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";

import { NAV_ITEMS } from "@/components/layout/navigation";

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-24 z-50 w-[min(680px,92vw)] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#0B1220]/95 p-2 shadow-glow">
          <Command className="rounded-xl">
            <Command.Input
              placeholder="Jump to page, type a concept, or open quiz mode..."
              className="h-12 w-full border-b border-white/15 bg-transparent px-4 text-sm text-slate-100 outline-none"
            />
            <Command.List className="max-h-[420px] overflow-y-auto py-2 scrollbar-thin">
              <Command.Empty className="px-4 py-6 text-sm text-slate-400">No results.</Command.Empty>
              <Command.Group heading="Navigation" className="px-2 text-xs text-slate-500">
                {NAV_ITEMS.map((item) => (
                  <Command.Item
                    key={item.href}
                    className="rounded-lg px-3 py-2 text-sm text-slate-200 aria-selected:bg-primary/20"
                    onSelect={() => setOpen(false)}
                  >
                    <Link href={item.href} className="w-full">
                      {item.label}
                    </Link>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
