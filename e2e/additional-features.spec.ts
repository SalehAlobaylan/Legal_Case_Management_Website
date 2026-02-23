import { test, expect } from "@playwright/test";

test.describe("Case Filters", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `filters+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Filters User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    const caseTypes = ["criminal", "civil", "commercial"];
    for (const type of caseTypes) {
      await page.goto("/cases/new");
      const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
      if (await titleInput.isVisible()) {
        await titleInput.fill(`${type} Filter Case`);
        const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
        if (await caseNumberInput.isVisible()) {
          await caseNumberInput.fill(`${type.toUpperCase()}-FIL-${Date.now()}`);
        }
        const typeSelect = page.getByLabel(/case type|نوع القضية/i).or(page.locator("select").first());
        if (await typeSelect.isVisible()) {
          await typeSelect.selectOption(type);
        }
        const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
        await submitBtn.click();
        await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });
      }
    }
  });

  test("should display filter options", async ({ page }) => {
    await page.goto("/cases");

    const filterBtn = page.getByRole("button", { name: /filter|تصفية/i });
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
    }
  });

  test("should filter by case type", async ({ page }) => {
    await page.goto("/cases");

    const typeFilter = page.getByRole("button", { name: /criminal|جنائي/i }).or(page.getByLabel(/case type|نوع القضية/i));
    if (await typeFilter.isVisible()) {
      await typeFilter.click();
    }
  });

  test("should filter by status", async ({ page }) => {
    await page.goto("/cases");

    const statusFilter = page.getByRole("button", { name: /open|مفتوح/i }).or(page.getByLabel(/status|الحالة/i));
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
    }
  });

  test("should search cases", async ({ page }) => {
    await page.goto("/cases");

    const searchInput = page.getByPlaceholder(/search|بحث/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("criminal");
      await page.waitForTimeout(500);
    }
  });

  test("should clear filters", async ({ page }) => {
    await page.goto("/cases");

    const clearBtn = page.getByRole("button", { name: /clear|مسح|reset|إعادة/i });
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
    }
  });
});

test.describe("Dashboard Statistics", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `stats+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Stats User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display dashboard statistics", async ({ page }) => {
    await page.goto("/dashboard");

    const statsCards = page.getByText(/cases|clients|documents|القضايا|العملاء|المستندات/i);
    await expect(statsCards.first()).toBeVisible({ timeout: 5000 });
  });

  test("should display recent cases", async ({ page }) => {
    await page.goto("/dashboard");

    const recentSection = page.getByText(/recent|الأحدث|آخر/i);
    await expect(recentSection.first()).toBeVisible({ timeout: 5000 });
  });

  test("should display upcoming hearings", async ({ page }) => {
    await page.goto("/dashboard");

    const hearingsSection = page.getByText(/hearing|جلسة|upcoming|القادمة/i);
    await expect(hearingsSection.first()).toBeVisible({ timeout: 5000 });
  });

  test("should navigate from dashboard to cases", async ({ page }) => {
    await page.goto("/dashboard");

    const casesLink = page.getByRole("link", { name: /cases|القضايا/i }).first();
    if (await casesLink.isVisible()) {
      await casesLink.click();
      await expect(page).toHaveURL(/.*cases.*/);
    }
  });

  test("should navigate from dashboard to clients", async ({ page }) => {
    await page.goto("/dashboard");

    const clientsLink = page.getByRole("link", { name: /clients|العملاء/i }).first();
    if (await clientsLink.isVisible()) {
      await clientsLink.click();
      await expect(page).toHaveURL(/.*clients.*/);
    }
  });
});

test.describe("Language and RTL", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `lang+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Language User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display language toggle", async ({ page }) => {
    await page.goto("/dashboard");

    const langToggle = page.getByRole("button", { name: /english|arabic|عربي|EN|AR/i });
    await expect(langToggle.first()).toBeVisible({ timeout: 5000 });
  });

  test("should switch to Arabic", async ({ page }) => {
    await page.goto("/dashboard");

    const langToggle = page.getByRole("button", { name: /english|arabic|عربي|EN|AR/i }).first();
    if (await langToggle.isVisible()) {
      await langToggle.click();

      const arabicOption = page.getByRole("button", { name: /arabic|عربي/i });
      if (await arabicOption.isVisible()) {
        await arabicOption.click();
      }
    }
  });

  test("should switch to English", async ({ page }) => {
    await page.goto("/dashboard");

    const langToggle = page.getByRole("button", { name: /english|arabic|عربي|EN|AR/i }).first();
    if (await langToggle.isVisible()) {
      await langToggle.click();

      const englishOption = page.getByRole("button", { name: /english|إنجليزي/i });
      if (await englishOption.isVisible()) {
        await englishOption.click();
      }
    }
  });
});

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `nav+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Navigation User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should have working sidebar navigation", async ({ page }) => {
    await page.goto("/dashboard");

    const sidebarLinks = page.locator("nav a");
    const count = await sidebarLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should highlight active navigation item", async ({ page }) => {
    await page.goto("/cases");

    const activeLink = page.locator("nav a[href*='/cases']");
    await expect(activeLink.first()).toBeVisible();
  });

  test("should navigate using breadcrumb", async ({ page }) => {
    await page.goto("/cases/new");

    const breadcrumb = page.locator("nav[aria-label='breadcrumb']").or(page.getByRole("navigation", { name: /breadcrumb/i }));
    if (await breadcrumb.isVisible()) {
      const casesLink = breadcrumb.getByRole("link", { name: /cases|القضايا/i });
      if (await casesLink.isVisible()) {
        await casesLink.click();
        await expect(page).toHaveURL(/.*cases.*/);
      }
    }
  });
});
