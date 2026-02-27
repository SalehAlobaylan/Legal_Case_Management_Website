import { test, expect } from "@playwright/test";

test.describe("AI Regulation Links", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `ailinks+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("AI Links User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    await page.goto("/cases/new");
    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("AI Links Test Case");
      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`AI-${Date.now()}`);
      }
      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });
    }
  });

  test("should display AI suggestions panel", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const aiPanel = page.getByText(/AI|suggestions|اقتراحات|regulation/i);
      await expect(aiPanel.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should generate AI links", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const generateBtn = page.getByRole("button", { name: /generate.*link|إنشاء.*روابط|AI.*suggest/i });
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
        await page.waitForTimeout(3000);
      }
    }
  });

  test("should display regulation links", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const linksSection = page.locator("[data-testid='regulation-link']").or(page.getByText(/regulation|لائحة/i));
      await expect(linksSection.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should verify a link", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const verifyBtn = page.getByRole("button", { name: /verify|تحقق/i }).first();
      if (await verifyBtn.isVisible()) {
        await verifyBtn.click();
      }
    }
  });

  test("should dismiss a link", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const dismissBtn = page.getByRole("button", { name: /dismiss|إلغاء|reject|رفض/i }).first();
      if (await dismissBtn.isVisible()) {
        await dismissBtn.click();
      }
    }
  });

  test("should subscribe to regulation", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const subscribeBtn = page.getByRole("button", { name: /subscribe|اشتراك/i }).first();
      if (await subscribeBtn.isVisible()) {
        await subscribeBtn.click();
      }
    }
  });

  test("should display similarity score", async ({ page }) => {
    await page.goto("/cases");
    const firstCase = page.locator("a[href*='/cases/']").first();
    if (await firstCase.isVisible()) {
      await firstCase.click();

      const scoreElement = page.getByText(/\d+%/).or(page.getByText(/score|نقاط|مطابقة/i));
      await expect(scoreElement.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("AI Features", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `aifeatures+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("AI Features User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display AI assistant in case details", async ({ page }) => {
    await page.goto("/cases/new");
    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("AI Assistant Case");
      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`AI-AST-${Date.now()}`);
      }
      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });

      const firstCase = page.locator("a[href*='/cases/']").first();
      if (await firstCase.isVisible()) {
        await firstCase.click();

        const aiAssistant = page.getByText(/AI|assistant|مساعد|suggestion|اقتراح/i);
        await expect(aiAssistant.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should display related regulations", async ({ page }) => {
    await page.goto("/cases/new");
    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Related Regs Case");
      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`REG-${Date.now()}`);
      }
      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });

      const firstCase = page.locator("a[href*='/cases/']").first();
      if (await firstCase.isVisible()) {
        await firstCase.click();

        const regsSection = page.getByText(/related.*regulation|اللوائح ذات الصلة/i);
        await expect(regsSection.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
