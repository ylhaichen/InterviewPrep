import { cn } from "@/lib/utils/cn";

export function TopicChip({ topic, className }: { topic: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-cyan-400/35 bg-cyan-400/10 px-2 py-1 text-[11px] font-medium text-cyan-200",
        className
      )}
    >
      {topic}
    </span>
  );
}
