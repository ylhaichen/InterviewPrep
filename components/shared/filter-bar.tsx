import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}
