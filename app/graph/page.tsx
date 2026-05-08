import { KnowledgeGraphCanvas } from "@/components/graph/knowledge-graph-canvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { getKnowledgeGraph } from "@/lib/services/graph";

export default async function GraphPage({
  searchParams
}: {
  searchParams?: Promise<{ topic?: string; nodeType?: "Paper" | "Concept" | "Question" | "All" }>;
}) {
  const params = (await searchParams) ?? {};
  const graph = await getKnowledgeGraph({ topic: params.topic, nodeType: params.nodeType ?? "All" });

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_1fr_120px]" method="get">
            <Select name="topic" defaultValue={params.topic ?? ""}>
              <option value="">All topics</option>
              <option value="VLA">VLA</option>
              <option value="World Model">World Model</option>
              <option value="RL Post-training">RL Post-training</option>
              <option value="Embodied Intelligence">Embodied Intelligence</option>
            </Select>
            <Select name="nodeType" defaultValue={params.nodeType ?? "All"}>
              <option value="All">All nodes</option>
              <option value="Paper">Paper</option>
              <option value="Concept">Concept</option>
              <option value="Question">Question</option>
            </Select>
            <button
              type="submit"
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-primary/35"
            >
              Apply
            </button>
          </form>
        </CardContent>
      </Card>

      <KnowledgeGraphCanvas nodes={graph.nodes} edges={graph.edges} stats={graph.stats} />
    </div>
  );
}
