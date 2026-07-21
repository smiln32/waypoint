import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "playwright/test";
import { searchResults } from "../../lib/demo-data";

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

test("Resume review shows findings and highest-leverage decisions separately", async ({ page }) => {
  await page.goto("/resume");

  // The count now reads findings, not decisions.
  await expect(page.getByText("3 findings", { exact: true })).toBeVisible();

  // Three findings render as their own articles.
  await expect(page.locator(".review .finding")).toHaveCount(3);

  // The three decisions render in a separate, labeled region — never inside a finding.
  const decisions = page.getByRole("region", { name: "Highest-leverage decisions" });
  await expect(decisions.getByRole("heading", { name: "Highest-leverage decisions" })).toBeVisible();
  await expect(decisions.locator("ol > li")).toHaveCount(3);
  await expect(page.locator(".finding .decisions")).toHaveCount(0);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("an old saved résumé does not override the current James Carter sample", async ({ page }) => {
  // Seed a stale value with no sample id, as a returning visitor's browser would hold.
  await page.addInitScript(() => {
    localStorage.setItem(
      "waypoint.resume",
      JSON.stringify({
        html: "<h1>Jordan Reyes</h1><p>Stale resume from an earlier sample.</p>",
        findings: [],
        decisions: [],
        note: "old",
        source: "demo",
      }),
    );
  });
  await page.goto("/resume");

  const editableResume = page.getByRole("article", { name: "Editable resume" });
  await expect(editableResume.getByRole("heading", { level: 1, name: "James Carter" })).toBeVisible();
  await expect(page.getByText("Jordan Reyes")).toHaveCount(0);
  await expect(page.getByText("Stale resume from an earlier sample.")).toHaveCount(0);

  // The seeded findings and decisions come back with the current sample.
  await expect(page.locator(".review .finding")).toHaveCount(3);
  await expect(
    page.getByRole("region", { name: "Highest-leverage decisions" }).locator("ol > li"),
  ).toHaveCount(3);
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

test("workflow pages begin naturally without the hard-coded profile top bar", async ({ page }) => {
  const workflowPaths = ["/resume", "/search", "/applications", "/cover-letter", "/interview"];
  const viewports = [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 375, height: 812 },
    { width: 320, height: 812 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const path of workflowPaths) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
      await expect(page.locator(".work > header")).toHaveCount(0);
      await expect(page.getByText("Profile evidence verified", { exact: true })).toHaveCount(0);

      const layout = await page.locator(".work").evaluate((work) => {
        const content = work.querySelector(".page");
        if (!(content instanceof HTMLElement)) throw new Error("Page content not found");
        return {
          contentOffset: content.getBoundingClientRect().top - work.getBoundingClientRect().top,
          pageClientWidth: document.documentElement.clientWidth,
          pageScrollWidth: document.documentElement.scrollWidth,
        };
      });
      expect(layout.contentOffset).toBeLessThanOrEqual(40);
      expect(layout.pageScrollWidth).toBeLessThanOrEqual(layout.pageClientWidth);
    }
  }
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
    const undo = history.getByRole("button", { name: "Back" });
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

test("Job Search exposes only functional USAJOBS filters and submits current selections", async ({ page }) => {
  const requests: URL[] = [];
  await page.route("**/api/jobs?**", async (route) => {
    requests.push(new URL(route.request().url()));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ source: "usajobs", results: [] }),
    });
  });

  await page.goto("/search");
  await expect(page.getByRole("heading", { name: "USAJOBS results" })).toBeVisible();
  expect(requests).toHaveLength(1);

  const expectedOptions = {
    "Date posted": ["Any time", "Past 24 hours", "Past week", "Past month"],
    "Work schedule": ["All schedules", "Full-time", "Part-time"],
    "Minimum salary": ["Any salary", "$50,000+", "$75,000+", "$100,000+", "$125,000+"],
    "Distance from location": [
      "Exact location",
      "Within 25 miles",
      "Within 50 miles",
      "Within 75 miles",
      "Within 100 miles",
    ],
  };

  for (const [label, options] of Object.entries(expectedOptions)) {
    const select = page.getByRole("combobox", { name: label });
    await expect(select).toBeVisible();
    expect(await select.locator("option").allTextContents()).toEqual(options);
  }

  await expect(page.getByRole("combobox")).toHaveCount(4);
  await expect(page.getByText("Workplace", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Experience", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Job type", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Quick apply only", { exact: true })).toHaveCount(0);

  await page.getByRole("combobox", { name: "Date posted" }).selectOption("7");
  await page.getByRole("combobox", { name: "Work schedule" }).selectOption("1");
  await page.getByRole("combobox", { name: "Minimum salary" }).selectOption("75000");
  await page.getByRole("combobox", { name: "Distance from location" }).selectOption("50");
  expect(requests).toHaveLength(1);

  await page.getByRole("button", { name: "Search jobs" }).click();
  await expect.poll(() => requests.length).toBe(2);
  const submitted = requests[1].searchParams;
  expect(submitted.get("q")).toBe("operations");
  expect(submitted.get("loc")).toBe("Jacksonville, NC");
  expect(submitted.get("datePosted")).toBe("7");
  expect(submitted.get("schedule")).toBe("1");
  expect(submitted.get("minimumSalary")).toBe("75000");
  expect(submitted.get("radius")).toBe("50");

  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
});
test("Job Search exposes Save, Saved, and Tracked states by posting", async ({ page }) => {
  await page.route("**/api/jobs?**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ source: "sample", results: searchResults }),
    });
  });
  await page.goto("/search");
  await expect(page.getByRole("heading", { name: "Sample results" })).toBeVisible();

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

test("Job Search links live results to official USAJOBS postings only when available", async ({ page }) => {
  await page.route("**/api/jobs?**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        source: "usajobs",
        results: [
          {
            id: "posting-with-url",
            source: "usajobs",
            title: "Operations Manager",
            company: "Department of Testing",
            place: "Norfolk, VA",
            pay: "$90,000–$110,000",
            age: "Posted today",
            type: "Full-time",
            apply: "USAJOBS.gov",
            fit: "",
            url: "https://www.usajobs.gov/job/123456789",
          },
          {
            id: "posting-without-url",
            source: "usajobs",
            title: "Logistics Manager",
            company: "Department of Testing",
            place: "Norfolk, VA",
            pay: "$80,000–$100,000",
            age: "Posted today",
            type: "Full-time",
            apply: "USAJOBS.gov",
            fit: "",
          },
        ],
      }),
    });
  });

  await page.goto("/search");
  const link = page.getByRole("link", { name: "View on USAJOBS" });
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute("href", "https://www.usajobs.gov/job/123456789");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByRole("button", { name: "Save Operations Manager at Department of Testing" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Save Logistics Manager at Department of Testing" })).toBeEnabled();
});

test("Job Search shows an explicit error without fictional results", async ({ page }) => {
  await page.route("**/api/jobs?**", async (route) => {
    await route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({
        source: "error",
        message: "Live USAJOBS search is temporarily unavailable.",
      }),
    });
  });

  await page.goto("/search");
  await expect(page.getByRole("heading", { name: "Search unavailable" })).toBeVisible();
  await expect(page.getByText("Live USAJOBS search is temporarily unavailable.")).toBeVisible();
  await expect(page.locator(".search-results article")).toHaveCount(0);
  await expect(page.getByText(/% fit/)).toHaveCount(0);
  await expect(page.getByText("Sample roles.", { exact: false })).toHaveCount(0);

  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
});

test("required Add Position fields use native validation and receive focus", async ({ page }) => {
  await page.goto("/applications");
  await page.getByRole("button", { name: "Add Position" }).click();
  await page.getByRole("button", { name: "Add position", exact: true }).click();
  const role = page.getByRole("textbox", { name: "Role title *" });
  await expect(role).toBeFocused();
  expect(await role.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
});

test("Job Tracking pluralizes interview summary wording for zero, one, and two", async ({ page }) => {
  await page.addInitScript(() => {
    const count = Number(new URL(window.location.href).searchParams.get("interviewCount") ?? "0");
    const records = Array.from({ length: count }, (_, index) => ({
      id: "interview-" + (index + 1),
      company: "Company " + (index + 1),
      role: "Operations Manager",
      source: "manual",
      status: "Interview",
      createdAt: "2026-07-18T12:00:00.000Z",
      statusChangedAt: "2026-07-18T12:00:00.000Z",
      materials: {
        resume: "Resume ready",
        coverLetter: "Cover letter ready",
      },
      nextAction: {
        kind: "practice-interview",
        label: "Interview Prep",
      },
    }));
    localStorage.setItem(
      "waypoint.opportunities.v2",
      JSON.stringify({ version: 2, records }),
    );
  });

  const cases = [
    { count: 0, label: "Interviews", detail: "0 roles at interview stage" },
    { count: 1, label: "Interview", detail: "1 role at interview stage" },
    { count: 2, label: "Interviews", detail: "2 roles at interview stage" },
  ];

  for (const scenario of cases) {
    await page.goto("/applications?interviewCount=" + scenario.count);
    const summary = page.locator(".application-summary");
    await expect(summary.getByText(scenario.label, { exact: true })).toBeVisible();
    await expect(summary.getByText(scenario.detail, { exact: true })).toBeVisible();
  }
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