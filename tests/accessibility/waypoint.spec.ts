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

test("primary navigation reflows without horizontal overflow", async ({ page }) => {
  const expectedLinks = [
    "Start Here",
    "Dashboard",
    "Resume",
    "Job Search",
    "Job Tracking",
    "Cover Letter",
    "Interview Prep",
  ];

  const verifyNavigation = async (width: number, enlargeText = false) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 812 });
    await page.goto("/search");
    const navigation = page.getByRole("navigation", { name: "Primary navigation" });
    if (enlargeText) {
      await navigation.evaluate((element) => {
        element.style.fontSize = "200%";
      });
    }
    const links = navigation.getByRole("link");
    await expect(links).toHaveCount(expectedLinks.length);
    await expect(links).toHaveText(expectedLinks);
    await expect(navigation.getByRole("link", { name: "Job Search" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    const layout = await navigation.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      pageClientWidth: document.documentElement.clientWidth,
      pageScrollWidth: document.documentElement.scrollWidth,
      links: Array.from(element.querySelectorAll("a")).map((link) => {
        const rect = link.getBoundingClientRect();
        return {
          clientHeight: link.clientHeight,
          clientWidth: link.clientWidth,
          left: rect.left,
          right: rect.right,
          scrollHeight: link.scrollHeight,
          scrollWidth: link.scrollWidth,
          top: rect.top,
        };
      }),
    }));

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
    expect(layout.pageScrollWidth).toBeLessThanOrEqual(layout.pageClientWidth);
    for (const link of layout.links) {
      expect(link.left).toBeGreaterThanOrEqual(0);
      expect(link.right).toBeLessThanOrEqual(layout.pageClientWidth);
      expect(link.scrollWidth).toBeLessThanOrEqual(link.clientWidth);
      expect(link.scrollHeight).toBeLessThanOrEqual(link.clientHeight);
    }

    for (let index = 1; index < layout.links.length; index += 1) {
      const previous = layout.links[index - 1];
      const current = layout.links[index];
      expect(current.top > previous.top || current.left > previous.left).toBe(true);
    }

    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    for (const name of expectedLinks) {
      await page.keyboard.press("Tab");
      const link = navigation.getByRole("link", { name });
      await expect(link).toBeFocused();
      expect(
        await link.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return rect.left >= 0 && rect.right <= document.documentElement.clientWidth;
        }),
      ).toBe(true);
    }
  };

  await verifyNavigation(768);
  await verifyNavigation(375);
  await verifyNavigation(320, true);
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