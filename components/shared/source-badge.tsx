import { Badge } from "@/components/ui/badge";

const SOURCE_VARIANT: Record<string, "primary" | "secondary" | "warning" | "muted"> = {
  arxiv: "primary",
  semantic_scholar: "secondary",
  github: "warning",
  lab_blog: "secondary",
  huggingface: "primary",
  other: "muted",
  manual: "muted"
};

export function SourceBadge({ source }: { source: string }) {
  return <Badge variant={SOURCE_VARIANT[source] ?? "muted"}>{source.replaceAll("_", " ")}</Badge>;
}
