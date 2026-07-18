import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "playwright/test";

const routes = [
  ["Dashboard", "/"],
  ["Resume", "/resume"],
  ["Job Search", "/search"],
  ["Job Tracking", "/applications"],
  ["Cover Letter", "/cover-letter"],
  ["Interview Practice", "/interview"],
] as const;

for (const [name, path] of routes) {
  test(`${name} has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("shared navigation and skip link work from the keyboard", async ({ page }) => {
  await page.goto("/resume");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();

  await page.goto("/resume");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const logo = page.getByRole("link", { name: "Waypoint" });
  await expect(logo).toBeFocused();
  const outlineStyle = await logo.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outlineStyle).not.toBe("none");

  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(navigation.getByRole("link", { name: "Resume" })).toHaveAttribute("aria-current", "page");
});

test("Job Search exposes Save, Saved, and Tracked states by posting", async ({ page }) => {
  await page.goto("/search");
  await expect(page.getByRole("heading", { name: "Recommended results" })).toBeVisible();

  const tracked = page.getByRole("button", {
    name: "Tracked Technical Operations Manager at AeroNorth Systems",
  });
  await expect(tracked).toBeDisabled();
  await expect(tracked).toHaveAttribute("aria-pressed", "true");

  const save = page.getByRole("button", {
    name: "Save Maintenance Planning Manager at Harbor Aviation",
  });
  await expect(save).toBeEnabled();
  await save.click();
  const saved = page.getByRole("button", {
    name: "Saved Maintenance Planning Manager at Harbor Aviation",
  });
  await expect(saved).toBeEnabled();
  await expect(saved).toHaveAttribute("aria-pressed", "true");
  await saved.click();
  await expect(save).toBeVisible();
});

test("required Add Position fields use native validation and receive focus", async ({ page }) => {
  await page.goto("/applications");
  await page.getByRole("button", { name: "Add Position" }).click();
  await page.getByRole("button", { name: "Add position", exact: true }).click();
  const role = page.getByRole("textbox", { name: "Role title *" });
  await expect(role).toBeFocused();
  expect(await role.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
});

test("Job Tracking names its table and preserves a valid empty state", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("waypoint.opportunities.v2", JSON.stringify({ version: 2, records: [] }));
  });
  await page.goto("/applications");
  await expect(page.getByRole("table", { name: "Tracked job opportunities and next actions" })).toBeVisible();
  await expect(page.getByText("No positions tracked yet. Save a role from Job Search or add one here.")).toBeVisible();
});

test("calendar has a screen-reader summary and visual grid is decorative", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 3, name: /Follow-ups due in/ })).toBeAttached();
  await expect(page.locator(".month-cal")).toHaveAttribute("aria-hidden", "true");
});

test("toast feedback is announced as an atomic polite status", async ({ page }) => {
  await page.goto("/search");
  const alert = page.getByRole("checkbox", { name: "Alert me to new jobs" });
  await alert.check();
  const toast = page.getByRole("status").filter({ hasText: "Job alert created" });
  await expect(toast).toHaveAttribute("aria-live", "polite");
  await expect(toast).toHaveAttribute("aria-atomic", "true");
});