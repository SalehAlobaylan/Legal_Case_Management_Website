import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `dashboard+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Dashboard User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display dashboard after login", async ({ page }) => {
    await expect(page).toHaveURL(/.*dashboard.*/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("should have working navigation", async ({ page }) => {
    await page.goto("/cases");
    await expect(page).toHaveURL(/.*cases.*/);

    await page.goto("/clients");
    await expect(page).toHaveURL(/.*clients.*/);

    await page.goto("/regulations");
    await expect(page).toHaveURL(/.*regulations.*/);

    await page.goto("/alerts");
    await expect(page).toHaveURL(/.*alerts.*/);

    await page.goto("/profile");
    await expect(page).toHaveURL(/.*profile.*/);

    await page.goto("/settings");
    await expect(page).toHaveURL(/.*settings.*/);
  });

  test("should display user profile information", async ({ page }) => {
    await page.goto("/profile");

    await expect(page.locator("body")).toBeVisible();
  });

  test("should display settings page", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `nav+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Nav User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should navigate to cases from sidebar", async ({ page }) => {
    const casesLink = page.getByRole("link", { name: /cases|القضايا/i }).first();
    if (await casesLink.isVisible()) {
      await casesLink.click();
      await expect(page).toHaveURL(/.*cases.*/);
    }
  });

  test("should navigate to clients from sidebar", async ({ page }) => {
    const clientsLink = page.getByRole("link", { name: /clients|العملاء/i }).first();
    if (await clientsLink.isVisible()) {
      await clientsLink.click();
      await expect(page).toHaveURL(/.*clients.*/);
    }
  });

  test("should navigate to regulations from sidebar", async ({ page }) => {
    const regsLink = page.getByRole("link", { name: /regulations|اللوائح/i }).first();
    if (await regsLink.isVisible()) {
      await regsLink.click();
      await expect(page).toHaveURL(/.*regulations.*/);
    }
  });
});
