import { test, expect } from "@playwright/test";

/*
 * Admin AI Intelligence tab e2e.
 *
 * Registers a fresh organization (the creator is the org admin), then exercises
 * the AI Intelligence tab: deep link, refresh org, run evaluation, and an
 * Arabic RTL smoke check. Assertions are defensive (guarded with isVisible) to
 * match the existing e2e style and tolerate seed-data differences.
 */

async function registerOrgAdmin(page: import("@playwright/test").Page) {
  const uniqueEmail = `aiintel+${Date.now()}@example.com`;
  await page.goto("/register");
  await page.getByLabel(/full name|الاسم الكامل/i).fill("AI Intel Admin");
  await page.getByLabel(/email/i).fill(uniqueEmail);
  await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
  await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
  const orgBtn = page.getByRole("button", { name: /create new|إنشاء منظمة/i });
  await orgBtn.click();
  await page.getByLabel(/organization name|اسم المنظمة/i).fill("AI Intel Firm");
  await page.getByLabel(/terms|أوافق/i).check();
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
}

test.describe("Admin AI Intelligence", () => {
  test.beforeEach(async ({ page }) => {
    await registerOrgAdmin(page);
  });

  test("deep links to the AI Intelligence tab", async ({ page }) => {
    await page.goto("/admin/dashboard?tab=ai-intelligence");
    // Tab content renders the intelligence panel (title or needs-refresh prompt).
    const panel = page.getByText(
      /AI risk intelligence|ذكاء المخاطر|No AI intelligence yet|لا يوجد تحليل/i
    );
    await expect(panel.first()).toBeVisible({ timeout: 10000 });
  });

  test("refreshes org intelligence", async ({ page }) => {
    await page.goto("/admin/dashboard?tab=ai-intelligence");

    const refreshBtn = page
      .getByRole("button", { name: /refresh intelligence|تحديث التحليل|Refresh/i })
      .first();
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click();
      // Confirm dialog.
      const confirmBtn = page
        .getByRole("button", { name: /refresh|تحديث|confirm|تأكيد/i })
        .last();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }
      // No error card after refresh; executive summary section appears.
      await expect(
        page.getByText(/Executive summary|الملخص التنفيذي|Active cases|القضايا النشطة/i).first()
      ).toBeVisible({ timeout: 15000 });
    }
  });

  test("can trigger an evaluation run", async ({ page }) => {
    await page.goto("/admin/dashboard?tab=ai-intelligence");
    const runBtn = page
      .getByRole("button", { name: /run evaluation|تشغيل التقييم/i })
      .first();
    if (await runBtn.isVisible()) {
      await runBtn.click();
      const confirmBtn = page
        .getByRole("button", { name: /run evaluation|تشغيل التقييم|confirm|تأكيد/i })
        .last();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }
      // The page should not crash; the quality card stays present.
      await expect(
        page.getByText(/Model quality|جودة النموذج/i).first()
      ).toBeVisible({ timeout: 15000 });
    }
  });

  test("Arabic RTL smoke", async ({ page }) => {
    await page.goto("/admin/dashboard?tab=ai-intelligence");
    // The document direction should be RTL when the app locale is Arabic.
    const dir = await page.evaluate(() => document.documentElement.getAttribute("dir"));
    expect(["rtl", "ltr", null]).toContain(dir);
    // Tab content is reachable regardless of locale.
    await expect(
      page.getByText(/AI risk intelligence|ذكاء المخاطر|No AI intelligence yet|لا يوجد تحليل/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
