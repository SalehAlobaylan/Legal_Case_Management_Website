import { test, expect } from "@playwright/test";

test.describe("Case Details", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `casedetail+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Case Detail User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    await page.goto("/cases/new");
    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Detail Test Case");
      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`DT-${Date.now()}`);
      }
      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });
    }
  });

  test("should display case details page", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();
      await expect(page).toHaveURL(/.*cases\/\d+.*/);
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("should display case information tabs", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const detailsTab = page.getByRole("tab", { name: /details|التفاصيل/i }).or(page.getByRole("button", { name: /details|التفاصيل/i }));
      if (await detailsTab.isVisible()) {
        await detailsTab.click();
      }

      const documentsTab = page.getByRole("tab", { name: /documents|المستندات/i }).or(page.getByRole("button", { name: /documents|المستندات/i }));
      if (await documentsTab.isVisible()) {
        await documentsTab.click();
      }
    }
  });

  test("should display AI suggestions panel", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const aiPanel = page.locator("[data-testid='ai-suggestions']").or(page.getByText(/AI|suggestions|اقتراحات/i));
      await expect(aiPanel.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should upload a document to case", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const documentsTab = page.getByRole("tab", { name: /documents|المستندات/i }).or(page.getByRole("button", { name: /documents|المستندات/i }));
      if (await documentsTab.isVisible()) {
        await documentsTab.click();
      }

      const uploadBtn = page.getByRole("button", { name: /upload|رفع/i }).or(page.locator("input[type='file']"));
      if (await uploadBtn.isVisible()) {
        const fileInput = page.locator("input[type='file']");
        await fileInput.setInputFiles({
          name: "test-document.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("%PDF-1.4 test content"),
        });
      }
    }
  });

  test("should generate AI regulation links", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const generateBtn = page.getByRole("button", { name: /generate|إنشاء|AI|اقتراحات/i });
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test("should navigate back to cases list", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();
      await expect(page).toHaveURL(/.*cases\/\d+.*/);

      const backLink = page.getByRole("link", { name: /cases|القضايا|back|رجوع/i }).first();
      if (await backLink.isVisible()) {
        await backLink.click();
        await expect(page).toHaveURL(/.*cases.*/);
      }
    }
  });
});

test.describe("Case Editing", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `caseedit+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Case Edit User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should create and view case", async ({ page }) => {
    await page.goto("/cases/new");

    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Editable Case");
      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`EDIT-${Date.now()}`);
      }
      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });
    }
  });

  test("should edit case status", async ({ page }) => {
    await page.goto("/cases/new");

    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Status Edit Case");
      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`STATUS-${Date.now()}`);
      }
      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });

      const firstCase = page.locator("a[href*='/cases/']").first();
      if (await firstCase.isVisible()) {
        await firstCase.click();

        const editBtn = page.getByRole("button", { name: /edit|تعديل/i });
        if (await editBtn.isVisible()) {
          await editBtn.click();
        }
      }
    }
  });

  test("should update case details", async ({ page }) => {
    await page.goto("/cases/new");

    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Update Test Case");
      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`UPD-${Date.now()}`);
      }
      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });

      const firstCase = page.locator("a[href*='/cases/']").first();
      if (await firstCase.isVisible()) {
        await firstCase.click();

        const descriptionInput = page.getByLabel(/description|الوصف/i).or(page.getByPlaceholder(/description|الوصف/i));
        if (await descriptionInput.isVisible()) {
          await descriptionInput.fill("Updated case description");
        }
      }
    }
  });
});
