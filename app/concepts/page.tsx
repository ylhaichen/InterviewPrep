import { Suspense } from "react";

import { ConceptCard } from "@/components/concepts/concept-card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { listConcepts } from "@/lib/services/concepts";

async function ConceptList({ search, domain, difficulty }: { search?: string; domain?: string; difficulty?: string }) {
  const concepts = await listConcepts({ search, domain, difficulty });

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {concepts.map((concept) => (
        <ConceptCard key={concept.id} concept={concept} />
      ))}
    </div>
  );
}

export default async function ConceptAtlasPage({
  searchParams
}: {
  searchParams?: Promise<{ search?: string; domain?: string; difficulty?: string }>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>Concept Atlas</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_120px]" method="get">
            <Input name="search" defaultValue={params.search} placeholder="Search concept" />
            <Select name="domain" defaultValue={params.domain ?? ""}>
              <option value="">All domains</option>
              <option value="VLA">VLA</option>
              <option value="World Model">World Model</option>
              <option value="RL Post-training">RL Post-training</option>
              <option value="Embodied Intelligence">Embodied Intelligence</option>
              <option value="Robotics">Robotics</option>
              <option value="General ML">General ML</option>
            </Select>
            <Select name="difficulty" defaultValue={params.difficulty ?? ""}>
              <option value="">All levels</option>
              <option value="basic">basic</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
              <option value="research-level">research-level</option>
            </Select>
            <Button type="submit" variant="outline">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      <Suspense fallback={<LoadingSkeleton />}>
        <ConceptList search={params.search} domain={params.domain} difficulty={params.difficulty} />
      </Suspense>
    </div>
  );
}
