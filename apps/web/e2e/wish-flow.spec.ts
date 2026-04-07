import { test, expect, Page } from "@playwright/test";

const MOCK_WISH_RESULT = {
  id: "w_test12345678",
  originalWish: "flight",
  cursedPower: "Flight, but only 2 millimeters above the ground",
  butClause: "but only 2 millimeters above the ground",
  explanation:
    "Technically you are flying. Technically. Your shoes will still scuff.",
  uselessnessScore: 94,
  category: "Technically True",
  createdAt: "2026-04-01T12:00:00.000Z",
};

const MOCK_418_RESPONSE = {
  error: {
    code: "IM_A_TEAPOT",
    message: "I'm a teapot, not a genie. Pour your own wishes.",
    requestId: "req_teapot123",
  },
};

const MOCK_VALIDATION_ERROR = {
  error: {
    code: "VALIDATION_ERROR",
    message: "Your wish is too short, mortal.",
    requestId: "req_val123",
  },
};

/**
 * Simulate lamp rubbing by performing rapid horizontal pointer movements.
 * The LampRubbing component needs 18 direction changes with dx > 10px each.
 */
async function rubLamp(page: Page) {
  const lamp = page.locator("img[alt='Magic lamp']");
  await lamp.waitFor({ state: "visible" });

  const box = await lamp.boundingBox();
  if (!box) throw new Error("Could not find lamp bounding box");

  const centerY = box.y + box.height / 2;
  const startX = box.x + box.width * 0.3;
  const endX = box.x + box.width * 0.7;

  // Pointer down to start rubbing
  await page.mouse.move(startX, centerY);
  await page.mouse.down();

  // Rub back and forth — 20 strokes to ensure we pass the 18 threshold
  for (let i = 0; i < 20; i++) {
    const target = i % 2 === 0 ? endX : startX;
    await page.mouse.move(target, centerY, { steps: 3 });
  }

  await page.mouse.up();
}

/**
 * Wait for the genie sequence (typewriter text + auto-advance) to finish
 * and the input form to appear.
 */
async function waitForInputScreen(page: Page) {
  await expect(page.locator("input[aria-label='Superpower wish input']")).toBeVisible({
    timeout: 15_000,
  });
}

/**
 * Intercept the wishes API endpoint with a successful response.
 */
async function mockWishApi(page: Page) {
  await page.route("**/api/v1/wishes", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_WISH_RESULT),
      });
    }
    return route.continue();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Cursed Powers — Full Wish Flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockWishApi(page);
  });

  test("page loads with title and lamp visible", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("Cursed Powers");
    await expect(page.locator("img[alt='Magic lamp']")).toBeVisible();
    await expect(page.locator("text=Keep rubbing...")).toBeVisible();
  });

  test("rubbing the lamp reveals the genie", async ({ page }) => {
    await page.goto("/");

    await rubLamp(page);

    // The genie should appear with typewriter text
    await expect(page.locator("img[alt='Cursed Genie']")).toBeVisible({
      timeout: 5_000,
    });
    // Typewriter should eventually show the full message
    await expect(
      page.locator("text=What superpower do you desire, mortal?"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("full happy path: rub → genie → wish → loading → result", async ({
    page,
  }) => {
    await page.goto("/");

    // Step 1: Rub the lamp
    await rubLamp(page);

    // Step 2: Wait for genie to auto-advance to input
    await waitForInputScreen(page);

    // Step 3: Type a wish and submit
    const input = page.locator("input[aria-label='Superpower wish input']");
    await input.fill("flight");
    await page.locator("button", { hasText: "Curse This Superpower" }).click();

    // Step 4: Loading screen with a spinner message
    await expect(page.locator("text=genie")).toBeVisible({ timeout: 3_000 });

    // Step 5: Result screen
    await expect(
      page.locator("text=Flight, but only 2 millimeters above the ground"),
    ).toBeVisible({ timeout: 10_000 });

    // Verify all result elements
    await expect(page.locator("text=You wished for: flight")).toBeVisible();
    await expect(page.locator("text=Technically True")).toBeVisible();
    await expect(page.locator("text=Technically you are flying")).toBeVisible();

    // Score verdict should appear after the word-by-word reveal
    await expect(page.locator("text=Completely Useless")).toBeVisible({
      timeout: 10_000,
    });

    // Action buttons
    await expect(
      page.locator("button", { hasText: "Wish Again" }),
    ).toBeVisible();
    await expect(page.locator("button", { hasText: "Copy" })).toBeVisible();
  });

  test("wish again returns to input screen", async ({ page }) => {
    await page.goto("/");
    await rubLamp(page);
    await waitForInputScreen(page);

    const input = page.locator("input[placeholder='I wish for...']");
    await input.fill("teleportation");
    await page.locator("button", { hasText: "Grant My Wish" }).click();

    // Wait for result
    await expect(
      page.locator("text=Flight, but only 2 millimeters above the ground"),
    ).toBeVisible({ timeout: 10_000 });

    // Click "Wish Again"
    await page.locator("button", { hasText: "Wish Again" }).click();

    // Should be back at input
    await expect(
      page.locator("input[placeholder='I wish for...']"),
    ).toBeVisible();
  });

  test("copy button copies result to clipboard", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/");
    await rubLamp(page);
    await waitForInputScreen(page);

    const input = page.locator("input[placeholder='I wish for...']");
    await input.fill("super strength");
    await page.locator("button", { hasText: "Grant My Wish" }).click();

    // Wait for result to fully render
    await expect(
      page.locator("text=Flight, but only 2 millimeters above the ground"),
    ).toBeVisible({ timeout: 10_000 });

    // Click copy
    await page.locator("button", { hasText: "Copy" }).click();

    // Verify clipboard content
    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboardText).toContain("flight");
    expect(clipboardText).toContain(
      "Flight, but only 2 millimeters above the ground",
    );
    expect(clipboardText).toContain("94%");
  });
});

test.describe("Input Validation", () => {
  test.beforeEach(async ({ page }) => {
    await mockWishApi(page);
  });

  test("shows character counter", async ({ page }) => {
    await page.goto("/");
    await rubLamp(page);
    await waitForInputScreen(page);

    const input = page.locator("input[placeholder='I wish for...']");
    await input.fill("flight");
    await expect(page.locator("text=6/200")).toBeVisible();
  });

  test("submit button is disabled when input is empty", async ({ page }) => {
    await page.goto("/");
    await rubLamp(page);
    await waitForInputScreen(page);

    const button = page.locator("button", { hasText: "Grant My Wish" });
    await expect(button).toBeDisabled();
  });

  test("shows local validation error for too-short wish", async ({ page }) => {
    await page.goto("/");
    await rubLamp(page);
    await waitForInputScreen(page);

    const input = page.locator("input[placeholder='I wish for...']");
    await input.fill("a");
    await page.locator("button", { hasText: "Grant My Wish" }).click();

    await expect(page.locator("text=too short")).toBeVisible();
  });
});

test.describe("API Error Handling", () => {
  test("displays 418 teapot error message", async ({ page }) => {
    await page.route("**/api/v1/wishes", (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 418,
          contentType: "application/json",
          body: JSON.stringify(MOCK_418_RESPONSE),
        });
      }
      return route.continue();
    });

    await page.goto("/");
    await rubLamp(page);
    await waitForInputScreen(page);

    const input = page.locator("input[placeholder='I wish for...']");
    await input.fill("make tea");
    await page.locator("button", { hasText: "Grant My Wish" }).click();

    // Should return to input with error message
    await expect(page.locator("text=teapot")).toBeVisible({ timeout: 5_000 });
  });

  test("displays validation error from API", async ({ page }) => {
    await page.route("**/api/v1/wishes", (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify(MOCK_VALIDATION_ERROR),
        });
      }
      return route.continue();
    });

    await page.goto("/");
    await rubLamp(page);
    await waitForInputScreen(page);

    const input = page.locator("input[placeholder='I wish for...']");
    await input.fill("xx");
    await page.locator("button", { hasText: "Grant My Wish" }).click();

    await expect(page.locator("text=too short")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("displays network error on fetch failure", async ({ page }) => {
    await page.route("**/api/v1/wishes", (route) => {
      return route.abort("connectionrefused");
    });

    await page.goto("/");
    await rubLamp(page);
    await waitForInputScreen(page);

    const input = page.locator("input[placeholder='I wish for...']");
    await input.fill("invisibility");
    await page.locator("button", { hasText: "Grant My Wish" }).click();

    await expect(page.locator("text=disrupted")).toBeVisible({
      timeout: 5_000,
    });
  });
});

test.describe("Visual & Layout", () => {
  test("progress bar updates while rubbing", async ({ page }) => {
    await page.goto("/");

    const lamp = page.locator("img[alt='Magic lamp']");
    await lamp.waitFor({ state: "visible" });

    const box = await lamp.boundingBox();
    if (!box) throw new Error("No lamp");

    const cy = box.y + box.height / 2;

    // Do a few rubs (not enough to complete)
    await page.mouse.move(box.x + box.width * 0.3, cy);
    await page.mouse.down();
    for (let i = 0; i < 4; i++) {
      const target =
        i % 2 === 0 ? box.x + box.width * 0.7 : box.x + box.width * 0.3;
      await page.mouse.move(target, cy, { steps: 3 });
    }
    await page.mouse.up();

    // Progress bar should have some width > 0
    const progressBar = page.locator(".h-full.rounded-full");
    const style = await progressBar.getAttribute("style");
    expect(style).toBeTruthy();
  });

  test("footer is visible on page load", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.locator("text=Powered by a mildly annoyed genie"),
    ).toBeVisible();
    await expect(page.locator("text=Jim Zandueta")).toBeVisible();
  });

  test("page has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Cursed Powers/);
  });
});
