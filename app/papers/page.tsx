import { Suspense } from "react";

import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PaperCard } from "@/components/papers/paper-card";
import { PaperImportForm } from "@/components/papers/paper-import-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { listPapers } from "@/lib/services/papers";

async function PaperList({
  search,
  topic,
  priority,
  status
}: {
  search?: string;
  topic?: string;
  priority?: "Must Read" | "Skim" | "Archive";
  status?: "unread" | "reading" | "reviewed" | "archived";
}) {
  const papers = await listPapers({ search, topic, priority, status });

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {papers.map((paper) => (
        <PaperCard key={paper.id} paper={paper} />
      ))}
    </div>
  );
}

export default async function PaperRadarPage({
  searchParams
}: {
  searchParams?: Promise<{
    search?: string;
    topic?: string;
    priority?: "Must Read" | "Skim" | "Archive";
    status?: "unread" | "reading" | "reviewed" | "archived";
    focus?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>Paper Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_120px]" method="get">
            <Input name="search" defaultValue={params.search} placeholder="Search title" />
            <Input name="topic" defaultValue={params.topic} placeholder="Topic e.g. VLA" />
            <Select name="priority" defaultValue={params.priority ?? ""}>
              <option value="">All priorities</option>
              <option value="Must Read">Must Read</option>
              <option value="Skim">Skim</option>
              <option value="Archive">Archive</option>
            </Select>
            <Select name="status" defaultValue={params.status ?? ""}>
              <option value="">All statuses</option>
              <option value="unread">unread</option>
              <option value="reading">reading</option>
              <option value="reviewed">reviewed</option>
              <option value="archived">archived</option>
            </Select>
            <Button type="submit" variant="outline">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      <Suspense fallback={<LoadingSkeleton />}>
        <PaperList
          search={params.search}
          topic={params.topic}
          priority={params.priority}
          status={params.status}
        />
      </Suspense>

      {params.focus === "import" ? <PaperImportForm /> : null}

      {!params.focus ? (
        <Card>
          <CardContent className="pt-6">
            <PaperImportForm />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
