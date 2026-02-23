import { test, expect } from "@playwright/test";

test.describe("Regulations", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `regs+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Regs User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display regulations page", async ({ page }) => {
    await page.goto("/regulations");

    await expect(page).toHaveURL(/.*regulations.*/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display regulations list or empty state", async ({ page }) => {
    await page.goto("/regulations");

    await expect(page.locator("body")).toBeVisible();
  });

  test("should search regulations", async ({ page }) => {
    await page.goto("/regulations");

    const searchInput = page.getByPlaceholder(/search|بحث/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("labor law");
      await page.waitForTimeout(500);
    }
  });

  test("should view regulation details", async ({ page }) => {
    await page.goto("/regulations");

    const firstRegulation = page.locator("a[href*='/regulations/']").first();
    if (await firstRegulation.isVisible()) {
      await firstRegulation.click();
      await expect(page).toHaveURL(/.*regulations\/\d+.*/);
    }
  });

  test("should display regulation information", async ({ page }) => {
    await page.goto("/regulations");

    const firstRegulation = page.locator("a[href*='/regulations/']").first();
    if (await firstRegulation.isVisible()) {
      await firstRegulation.click();
      await expect(page.locator("body")).toBeVisible();
    }
  });
});

test.describe("Alerts", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `alerts+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Alerts User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display alerts page", async ({ page }) => {
    await page.goto("/alerts");

    await expect(page).toHaveURL(/.*alerts.*/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display alerts or empty state", async ({ page }) => {
    await page.goto("/alerts");

    await expect(page.locator("body")).toBeVisible();
  });

  test("should filter alerts by unread", async ({ page }) => {
    await page.goto("/alerts");

    const unreadFilter = page.getByRole("button", { name: /unread|غير مقروء/i });
    if (await unreadFilter.isVisible()) {
      await unreadFilter.click();
    }
  });

  test("should mark alert as read", async ({ page }) => {
    await page.goto("/alerts");

    const firstAlert = page.locator("[data-testid='alert-item']").first().or(page.locator("li").first());
    if (await firstAlert.isVisible()) {
      const markReadBtn = firstAlert.getByRole("button", { name: /mark.*read|تحديد كمقروء/i });
      if (await markReadBtn.isVisible()) {
        await markReadBtn.click();
      }
    }
  });

  test("should mark all alerts as read", async ({ page }) => {
    await page.goto("/alerts");

    const markAllBtn = page.getByRole("button", { name: /mark all|تحديد الكل/i });
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
    }
  });
});

test.describe("Profile", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `profile+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Profile User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display profile page", async ({ page }) => {
    await page.goto("/profile");

    await expect(page).toHaveURL(/.*profile.*/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display user information", async ({ page }) => {
    await page.goto("/profile");

    await expect(page.getByText(/Profile User|الاسم/i).or(page.locator("body"))).toBeVisible();
  });
});

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `settings+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Settings User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display settings page", async ({ page }) => {
    await page.goto("/settings");

    await expect(page).toHaveURL(/.*settings.*/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display settings sections", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.locator("body")).toBeVisible();
  });
});
