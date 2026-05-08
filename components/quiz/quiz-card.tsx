import { ReactNode } from "react";

import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuizCard({
  title,
  type,
  difficulty,
  children
}: {
  title: string;
  type: string;
  difficulty: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{type}</span>
            <DifficultyBadge value={difficulty} />
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
