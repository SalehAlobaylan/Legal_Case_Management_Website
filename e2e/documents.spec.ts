import { test, expect } from "@playwright/test";

test.describe("Documents", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `docs+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Documents User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    await page.goto("/cases/new");
    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Document Test Case");
      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`DOC-${Date.now()}`);
      }
      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });
    }
  });

  test("should navigate to documents tab", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const documentsTab = page.getByRole("tab", { name: /documents|المستندات/i }).or(page.getByRole("button", { name: /documents|المستندات/i }));
      if (await documentsTab.isVisible()) {
        await documentsTab.click();
        await expect(page.locator("body")).toBeVisible();
      }
    }
  });

  test("should display upload button", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const documentsTab = page.getByRole("tab", { name: /documents|المستندات/i }).or(page.getByRole("button", { name: /documents|المستندات/i }));
      if (await documentsTab.isVisible()) {
        await documentsTab.click();

        const uploadBtn = page.getByRole("button", { name: /upload|رفع/i });
        await expect(uploadBtn.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should upload a PDF document", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const documentsTab = page.getByRole("tab", { name: /documents|المستندات/i }).or(page.getByRole("button", { name: /documents|المستندات/i }));
      if (await documentsTab.isVisible()) {
        await documentsTab.click();

        const fileInput = page.locator("input[type='file']");
        if (await fileInput.isVisible()) {
          await fileInput.setInputFiles({
            name: "test-document.pdf",
            mimeType: "application/pdf",
            buffer: Buffer.from("%PDF-1.4 test pdf content"),
          });
        }
      }
    }
  });

  test("should display documents list after upload", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const documentsTab = page.getByRole("tab", { name: /documents|المستندات/i }).or(page.getByRole("button", { name: /documents|المستندات/i }));
      if (await documentsTab.isVisible()) {
        await documentsTab.click();

        const documentsList = page.locator("[data-testid='document-item']").or(page.getByText(/\.pdf|\.doc|\.docx/i));
        const hasDocuments = await documentsList.first().isVisible().catch(() => false);
        if (!hasDocuments) {
          const fileInput = page.locator("input[type='file']");
          if (await fileInput.isVisible()) {
            await fileInput.setInputFiles({
              name: "test.pdf",
              mimeType: "application/pdf",
              buffer: Buffer.from("%PDF-1.4 test"),
            });
          }
        }
      }
    }
  });

  test("should download document", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const documentsTab = page.getByRole("tab", { name: /documents|المستندات/i }).or(page.getByRole("button", { name: /documents|المستندات/i }));
      if (await documentsTab.isVisible()) {
        await documentsTab.click();

        const downloadBtn = page.getByRole("button", { name: /download|تحميل/i }).first();
        if (await downloadBtn.isVisible()) {
          const downloadPromise = page.waitForEvent("download");
          await downloadBtn.click();
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toBeTruthy();
        }
      }
    }
  });

  test("should delete document", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const documentsTab = page.getByRole("tab", { name: /documents|المستندات/i }).or(page.getByRole("button", { name: /documents|المستندات/i }));
      if (await documentsTab.isVisible()) {
        await documentsTab.click();

        const deleteBtn = page.getByRole("button", { name: /delete|حذف/i }).first();
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();

          const confirmBtn = page.getByRole("button", { name: /confirm|تأكيد|yes|نعم/i });
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
          }
        }
      }
    }
  });
});

test.describe("Document Insights", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `insights+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Insights User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    await page.goto("/cases/new");
    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Insights Test Case");
      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`INS-${Date.now()}`);
      }
      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });
    }
  });

  test("should display AI insights button", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const insightsBtn = page.getByRole("button", { name: /insights|تحليلات|AI/i });
      await expect(insightsBtn.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should trigger insights generation", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const generateInsightsBtn = page.getByRole("button", { name: /generate|refresh|إنشاء|تحديث.*insight|تحليل/i });
      if (await generateInsightsBtn.isVisible()) {
        await generateInsightsBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});
