import { QuizArenaClient } from "@/components/quiz/quiz-arena-client";

export default async function QuizPage({
  searchParams
}: {
  searchParams?: Promise<{ mode?: string; paperId?: string }>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <div className="pb-8">
      <QuizArenaClient initialMode={params.mode ?? "daily-review"} initialPaperId={params.paperId} />
    </div>
  );
}
