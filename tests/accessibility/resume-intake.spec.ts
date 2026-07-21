import { expect, test } from "playwright/test";

const importedResume = "Taylor Morgan\nMaintenance Operations Coordinator\nExperienced maintenance professional seeking a civilian operations role.";

test("demo mode shows local resume intake controls", async ({ page }) => {
  await page.goto("/resume");
  await expect(page.getByRole("heading", { level: 3, name: "Upload a file" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Upload resume" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Paste the text" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Paste resume text" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Use pasted resume" })).toBeVisible();
});

test("a pasted resume persists across reload in demo mode", async ({ page }) => {
  await page.goto("/resume");
  await page.getByRole("textbox", { name: "Paste resume text" }).fill(importedResume);
  await page.getByRole("button", { name: "Use pasted resume" }).click();

  const editableResume = page.getByRole("article", { name: "Editable resume" });
  await expect(editableResume).toContainText("Taylor Morgan");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("waypoint.resume") || "null"));
  expect(saved.origin).toBe("user");
  expect(saved.sampleId).toBeUndefined();

  await page.reload();
  await expect(editableResume).toContainText("Taylor Morgan");
  await expect(page.getByText("James Carter")).toHaveCount(0);
});

test("demo review identifies itself as limited", async ({ page }) => {
  await page.goto("/resume");
  await page.getByRole("textbox", { name: "Paste resume text" }).fill(importedResume);
  await page.getByRole("button", { name: "Use pasted resume" }).click();
  await page.getByRole("button", { name: "Resubmit for evaluation" }).click();

  await expect(page.getByText("Limited sample review.", { exact: true })).toBeVisible();
  await expect(page.getByText("No findings from this limited review set.", { exact: true })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "AI privacy notice" })).toContainText("not sent to any AI provider");
});
