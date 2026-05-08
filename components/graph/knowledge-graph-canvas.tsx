"use client";

import "@xyflow/react/dist/style.css";

import { useMemo, useState } from "react";
import { Background, Controls, MiniMap, Panel, ReactFlow } from "@xyflow/react";

import { Badge } from "@/components/ui/badge";

interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; kind: string; meta: string };
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  data?: { explanation?: string };
}

function nodeColor(kind: string): string {
  if (kind === "Paper") return "#38BDF8";
  if (kind === "Concept") return "#8B5CF6";
  if (kind === "Question") return "#22D3EE";
  return "#94A3B8";
}

export function KnowledgeGraphCanvas({
  nodes,
  edges,
  stats
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: { papers: number; concepts: number; questions: number; edges: number };
}) {
  const [hoverText, setHoverText] = useState<string>("Hover edge to inspect relation evidence.");

  const styledNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        style: {
          borderRadius: 14,
          padding: 12,
          background: "rgba(15, 23, 42, 0.9)",
          border: `1px solid ${nodeColor(node.data.kind)}66`,
          boxShadow: `0 0 0 1px ${nodeColor(node.data.kind)}33, 0 10px 24px rgba(0,0,0,0.32)`,
          color: "#E5E7EB",
          width: 220
        }
      })),
    [nodes]
  );

  const styledEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        style: { stroke: "rgba(56,189,248,0.45)", strokeWidth: 1.6 },
        labelStyle: { fill: "#94A3B8", fontSize: 10 },
        animated: true
      })),
    [edges]
  );

  return (
    <div className="glass relative h-[760px] rounded-2xl">
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        fitView
        onEdgeMouseEnter={(_, edge) => setHoverText(edge.data?.explanation ?? edge.label ?? "")}
      >
        <MiniMap
          pannable
          zoomable
          maskColor="rgba(5,7,13,0.45)"
          nodeColor={(node) => nodeColor((node.data as { kind?: string }).kind ?? "")}
        />
        <Controls className="!bg-slate-900/80 !text-slate-200" />
        <Background color="rgba(148,163,184,0.2)" gap={24} />

        <Panel position="top-left" className="space-x-2">
          <Badge variant="primary">Papers {stats.papers}</Badge>
          <Badge variant="secondary">Concepts {stats.concepts}</Badge>
          <Badge variant="warning">Questions {stats.questions}</Badge>
          <Badge variant="muted">Edges {stats.edges}</Badge>
        </Panel>

        <Panel position="bottom-left" className="max-w-lg rounded-xl border border-white/20 bg-slate-950/75 px-3 py-2 text-xs text-slate-300">
          {hoverText}
        </Panel>
      </ReactFlow>
    </div>
  );
}
