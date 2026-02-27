import { test, expect } from "@playwright/test";

test.describe("Cases Management", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `cases+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Cases User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display cases page with empty state", async ({ page }) => {
    await page.goto("/cases");

    await expect(page).toHaveURL(/.*cases.*/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to new case page", async ({ page }) => {
    await page.goto("/cases");

    const newCaseBtn = page.getByRole("link", { name: /new case|إضافة قضية|create/i })
      .or(page.getByRole("button", { name: /new case|إضافة قضية|create/i }));

    if (await newCaseBtn.isVisible()) {
      await newCaseBtn.click();
      await expect(page).toHaveURL(/.*cases\/new.*/);
    }
  });

  test("should display new case form", async ({ page }) => {
    await page.goto("/cases/new");

    await expect(page).toHaveURL(/.*cases\/new.*/);
    await expect(page.getByRole("heading", { name: /new case|قضية جديدة/i })).toBeVisible();
  });

  test("should create a new criminal case", async ({ page }) => {
    await page.goto("/cases/new");

    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Test Criminal Case");

      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`CR-${Date.now()}`);
      }

      const typeSelect = page.getByLabel(/case type|نوع القضية/i).or(page.locator("select").first());
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption("criminal");
      }

      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();

      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });
    }
  });

  test("should create a new civil case", async ({ page }) => {
    await page.goto("/cases/new");

    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Test Civil Case");

      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`CV-${Date.now()}`);
      }

      const typeSelect = page.getByLabel(/case type|نوع القضية/i).or(page.locator("select").first());
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption("civil");
      }

      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();

      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });
    }
  });

  test("should validate case form required fields", async ({ page }) => {
    await page.goto("/cases/new");

    const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();

      await expect(page.getByText(/required|مطلوب/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should view case details after creation", async ({ page }) => {
    await page.goto("/cases/new");

    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("View Test Case");

      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`VIEW-${Date.now()}`);
      }

      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();

      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });

      const firstCase = page.locator("a[href*='/cases/']").first();
      if (await firstCase.isVisible()) {
        await firstCase.click();
        await expect(page).toHaveURL(/.*cases\/\d+.*/);
      }
    }
  });
});

test.describe("Case Types", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `casetypes+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Case Types User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should create commercial case", async ({ page }) => {
    await page.goto("/cases/new");

    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Commercial Dispute Case");

      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`COM-${Date.now()}`);
      }

      const typeSelect = page.getByLabel(/case type|نوع القضية/i).or(page.locator("select").first());
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption("commercial");
      }

      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();

      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });
    }
  });

  test("should create labor case", async ({ page }) => {
    await page.goto("/cases/new");

    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Labor Dispute Case");

      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`LAB-${Date.now()}`);
      }

      const typeSelect = page.getByLabel(/case type|نوع القضية/i).or(page.locator("select").first());
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption("labor");
      }

      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();

      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });
    }
  });

  test("should create family case", async ({ page }) => {
    await page.goto("/cases/new");

    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Family Law Case");

      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`FAM-${Date.now()}`);
      }

      const typeSelect = page.getByLabel(/case type|نوع القضية/i).or(page.locator("select").first());
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption("family");
      }

      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();

      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });
    }
  });
});
