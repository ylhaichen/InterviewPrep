import { notFound } from "next/navigation";

import { ConceptDetailPanel } from "@/components/concepts/concept-detail-panel";
import { getConceptById } from "@/lib/services/concepts";

export default async function ConceptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const concept = await getConceptById(id);

  if (!concept) {
    notFound();
  }

  return (
    <div className="pb-8">
      <ConceptDetailPanel concept={concept} />
    </div>
  );
}
