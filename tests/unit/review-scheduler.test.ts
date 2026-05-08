import { computeReviewDecision } from "@/lib/review/scheduler";

describe("review scheduler", () => {
  it("schedules wrong answer for tomorrow", () => {
    const now = new Date("2026-05-06T09:00:00.000Z");
    const decision = computeReviewDecision(
      { correctCount: 2, wrongCount: 1, masteryScore: 54 },
      false,
      "high",
      now
    );

    expect(decision.nextReviewAt.startsWith("2026-05-07")).toBe(true);
    expect(decision.wrongCount).toBe(2);
  });

  it("uses 14 days for high confidence correct answers", () => {
    const now = new Date("2026-05-06T09:00:00.000Z");
    const decision = computeReviewDecision(
      { correctCount: 3, wrongCount: 0, masteryScore: 70 },
      true,
      "high",
      now
    );

    expect(decision.nextReviewAt.startsWith("2026-05-20")).toBe(true);
    expect(decision.correctCount).toBe(4);
  });

  it("uses 30 days once mastery is stable", () => {
    const now = new Date("2026-05-06T09:00:00.000Z");
    const decision = computeReviewDecision(
      { correctCount: 5, wrongCount: 0, masteryScore: 88 },
      true,
      "high",
      now
    );

    expect(decision.nextReviewAt.startsWith("2026-06-05")).toBe(true);
  });
});
