import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "playwright/test";

const expectMinimumTargetSize = async (locator: Locator) => {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
};

const expectTargetsToFit = async (locator: Locator) => {
  const targets = await locator.all();
  expect(targets.length).toBeGreaterThan(0);
  for (const target of targets) {
    await expectMinimumTargetSize(target);
    expect(
      await target.evaluate(
        (element) =>
          element.scrollWidth <= element.clientWidth &&
          element.scrollHeight <= element.clientHeight,
      ),
    ).toBe(true);
  }
};

const expectTargetsNotToOverlap = async (locator: Locator) => {
  const targets = await locator.all();
  const boxes: { x: number; y: number; width: number; height: number }[] = [];
  for (const target of targets) {
    const box = await target.boundingBox();
    if (box) boxes.push(box);
  }
  for (let first = 0; first < boxes.length; first += 1) {
    for (let second = first + 1; second < boxes.length; second += 1) {
      const a = boxes[first];
      const b = boxes[second];
      const overlapWidth = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const overlapHeight = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      expect(overlapWidth > 0 && overlapHeight > 0).toBe(false);
    }
  }
};

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
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Resume Studio preserves application and editable-document heading structure", async ({ page }) => {
  await page.goto("/resume");

  const pageHeading = page.getByRole("heading", { level: 1, name: "Resume Studio" });
  await expect(pageHeading).toBeVisible();
  await expect(page.locator("h1").first()).toHaveText("Resume Studio");
  await expect(page.getByRole("heading", { level: 2, name: "1. Add Your Resume" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "2. Review Your Resume" })).toBeVisible();

  const editableResume = page.getByRole("article", { name: "Editable resume" });
  await expect(editableResume).toBeVisible();
  await expect(editableResume.getByRole("heading", { level: 1, name: "James Carter" })).toBeVisible();
  expect(await page.locator("h1").allTextContents()).toEqual(["Resume Studio", "James Carter"]);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("editable resume expands to contain its document before following controls", async ({ page }) => {
  await page.goto("/resume");

  const editableResume = page.getByRole("article", { name: "Editable resume" });
  const privacyNotice = page.getByRole("complementary", { name: "AI privacy notice" });
  await expect(editableResume).toBeVisible();
  await expect(privacyNotice).toBeVisible();

  const layout = await editableResume.evaluate((article) => {
    const notice = document.querySelector(".resume-draft .ai-privacy-notice");
    if (!(notice instanceof HTMLElement)) throw new Error("Resume privacy notice not found");
    const articleRect = article.getBoundingClientRect();
    const noticeRect = notice.getBoundingClientRect();
    return {
      clientHeight: article.clientHeight,
      scrollHeight: article.scrollHeight,
      articleBottom: articleRect.bottom,
      noticeTop: noticeRect.top,
    };
  });

  expect(layout.scrollHeight).toBeLessThanOrEqual(layout.clientHeight);
  expect(layout.noticeTop).toBeGreaterThanOrEqual(layout.articleBottom);
});

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


test("audited controls meet Waypoint's 44px target at responsive viewports", async ({ page }) => {
  test.setTimeout(180_000);
  const viewports = [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 375, height: 812 },
    { width: 320, height: 812 },
  ];

  await page.addInitScript(() => {
    localStorage.setItem(
      "waypoint.briefs",
      JSON.stringify({
        "aeronorth-systems-technical-operations-manager": {
          slug: "aeronorth-systems-technical-operations-manager",
          company: "AeroNorth Systems",
          role: "Technical Operations Manager",
          generatedAt: "2026-07-18T12:00:00.000Z",
          source: "claude",
          sections: {
            whoTheyAre: "",
            whatTheRoleOwns: "",
            whyYourRecordFits: "",
            likelyQuestions: "",
            honestGap: "",
          },
        },
      }),
    );
  });

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    await page.goto("/search");
    const navigation = page.getByRole("navigation", { name: "Primary navigation" });
    const navigationLinks = navigation.getByRole("link");
    await expect(navigationLinks).toHaveCount(7);
    await expectTargetsToFit(navigationLinks);
    await expectTargetsToFit(page.locator(".search-bar input"));
    await expectTargetsToFit(page.locator(".search-filters select"));
    await expectTargetsNotToOverlap(
      page.locator("nav a, .search-bar input, .search-filters select"),
    );
    await expect(navigation.getByRole("link", { name: "Job Search" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);

    await page.goto("/");
    await expectTargetsToFit(page.locator("button.link"));
    await expectTargetsNotToOverlap(page.locator("button.link"));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);

    await page.goto("/resume");
    const history = page.getByLabel("Resume edit history");
    const undo = history.getByRole("button", { name: "Undo" });
    const forward = history.getByRole("button", { name: "Forward" });
    await expectMinimumTargetSize(undo);
    await expectMinimumTargetSize(forward);
    await expect(undo).toBeDisabled();
    await expect(forward).toBeDisabled();
    await expectTargetsNotToOverlap(history.getByRole("button"));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);

    await page.goto("/cover-letter");
    await expectTargetsToFit(page.locator(".letter-toolbar input"));
    await expectTargetsNotToOverlap(page.locator(".letter-toolbar input"));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);

    await page.goto("/applications");
    await expect(page.locator(".application-table td small a")).toHaveCount(1);
    await expect(page.locator(".brief-generate")).toHaveCount(3);
    await expectTargetsToFit(page.locator("button.link"));
    await expectTargetsToFit(page.locator(".application-table td small a"));
    await expectTargetsToFit(page.locator(".brief-generate"));
    await expectTargetsNotToOverlap(
      page.locator("button.link, .application-table td small a, .brief-generate"),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);

    for (const path of ["/", "/search", "/resume", "/cover-letter", "/applications"]) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    }
  }
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