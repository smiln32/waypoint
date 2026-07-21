import { expect, test } from "playwright/test";

test("a TXT resume upload loads into the editable document in demo mode", async ({ page }) => {
  await page.goto("/resume");
  await page.locator('input[type="file"]').setInputFiles({
    name: "sample-resume.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Taylor Morgan\nMaintenance Operations Coordinator"),
  });

  const editableResume = page.getByRole("article", { name: "Editable resume" });
  await expect(editableResume).toContainText("Taylor Morgan");
  await expect(editableResume).toContainText("Maintenance Operations Coordinator");
});
