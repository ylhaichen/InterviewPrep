import { ReactNode } from "react";

import { CommandPalette } from "@/components/layout/command-palette";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[1700px] gap-4 px-4 py-4 lg:px-6">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopNav />
        <main>{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
