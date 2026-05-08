import { expect, test } from "@playwright/test";

test("core navigation and quiz flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Daily Briefing" })).toBeVisible();

  await page.goto("/papers");
  await expect(page.getByRole("heading", { name: "Paper Radar" })).toBeVisible();

  await page.goto("/concepts");
  await expect(page.getByRole("heading", { name: "Concept Atlas" })).toBeVisible();

  await page.goto("/quiz");
  await expect(page.getByRole("heading", { name: "Quiz Mode" })).toBeVisible();

  await page.goto("/graph");
  await expect(page.getByRole("heading", { name: "Knowledge Graph" })).toBeVisible();

  await page.goto("/interview");
  await expect(page.getByRole("heading", { name: "Interview Practice Mode" })).toBeVisible();
});
