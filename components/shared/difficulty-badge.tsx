import { Badge } from "@/components/ui/badge";

const MAP: Record<string, "success" | "warning" | "danger" | "secondary" | "muted"> = {
  basic: "success",
  intermediate: "warning",
  advanced: "danger",
  "research-level": "secondary"
};

export function DifficultyBadge({ value }: { value: string }) {
  return <Badge variant={MAP[value] ?? "muted"}>{value}</Badge>;
}
