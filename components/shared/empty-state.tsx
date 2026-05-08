import { Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="flex min-h-[180px] flex-col items-center justify-center gap-3 border-dashed border-white/20 text-center">
      <div className="rounded-full bg-primary/20 p-3 text-primary">
        <Sparkles size={18} />
      </div>
      <h4 className="text-sm font-semibold text-slate-100">{title}</h4>
      <p className="max-w-md text-xs text-slate-400">{description}</p>
    </Card>
  );
}
