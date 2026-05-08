import { AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui/card";

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-danger/40 bg-danger/10">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-danger/20 p-2 text-danger">
          <AlertTriangle size={18} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="text-xs text-slate-300">{description}</p>
        </div>
      </div>
    </Card>
  );
}
