import { notFound } from "next/navigation";

import { PaperReaderView } from "@/components/papers/paper-reader-view";
import { getPaperById } from "@/lib/services/papers";

export default async function PaperReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paper = await getPaperById(id);

  if (!paper) {
    notFound();
  }

  return (
    <div className="pb-8">
      <PaperReaderView paper={paper} />
    </div>
  );
}
