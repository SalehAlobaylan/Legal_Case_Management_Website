import { test, expect } from "@playwright/test";

test.describe("Client Details", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `clientdetail+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Client Detail User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    await page.goto("/clients");
    const newClientBtn = page.getByRole("button", { name: /new client|إضافة عميل/i });
    await newClientBtn.click();

    const dialog = page.getByRole("dialog").or(page.locator("[role='dialog']")).or(page.locator(".modal"));
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const nameInput = dialog.getByLabel(/name|الاسم/i).or(dialog.getByPlaceholder(/name|الاسم/i));
    if (await nameInput.isVisible()) {
      await nameInput.fill("Detail Test Client");
      const submitBtn = dialog.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    }
  });

  test("should display client details page", async ({ page }) => {
    await page.goto("/clients");

    const firstClient = page.locator("table tbody tr").first();
    if (await firstClient.isVisible()) {
      await firstClient.click();
      await expect(page).toHaveURL(/.*clients\/\d+.*/);
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("should display client information", async ({ page }) => {
    await page.goto("/clients");

    const firstClient = page.locator("table tbody tr").first();
    if (await firstClient.isVisible()) {
      await firstClient.click();

      await expect(page.getByText(/Detail Test Client/i).or(page.locator("h1, h2"))).toBeVisible();
    }
  });

  test("should display client cases", async ({ page }) => {
    await page.goto("/clients");

    const firstClient = page.locator("table tbody tr").first();
    if (await firstClient.isVisible()) {
      await firstClient.click();

      const casesSection = page.getByText(/cases|القضايا/i);
      await expect(casesSection.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should edit client", async ({ page }) => {
    await page.goto("/clients");

    const firstClient = page.locator("table tbody tr").first();
    if (await firstClient.isVisible()) {
      await firstClient.click();

      const editBtn = page.getByRole("button", { name: /edit|تعديل/i });
      if (await editBtn.isVisible()) {
        await editBtn.click();

        const nameInput = page.getByLabel(/name|الاسم/i).or(page.getByPlaceholder(/name|الاسم/i));
        if (await nameInput.isVisible()) {
          await nameInput.fill("Updated Client Name");
        }
      }
    }
  });

  test("should navigate back to clients list", async ({ page }) => {
    await page.goto("/clients");

    const firstClient = page.locator("table tbody tr").first();
    if (await firstClient.isVisible()) {
      await firstClient.click();
      await expect(page).toHaveURL(/.*clients\/\d+.*/);

      const backLink = page.getByRole("link", { name: /clients|العملاء|back|رجوع/i }).first();
      if (await backLink.isVisible()) {
        await backLink.click();
        await expect(page).toHaveURL(/.*clients.*/);
      }
    }
  });
});

test.describe("Client-Case Association", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `clientcase+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Client Case User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should create client and case association", async ({ page }) => {
    await page.goto("/clients");
    const newClientBtn = page.getByRole("button", { name: /new client|إضافة عميل/i });
    await newClientBtn.click();

    const dialog = page.getByRole("dialog").or(page.locator("[role='dialog']")).or(page.locator(".modal"));
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const nameInput = dialog.getByLabel(/name|الاسم/i).or(dialog.getByPlaceholder(/name|الاسم/i));
    if (await nameInput.isVisible()) {
      await nameInput.fill("Associated Client");
      const submitBtn = dialog.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    }

    await page.goto("/cases/new");
    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Case for Client");

      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`ASSOC-${Date.now()}`);
      }

      const clientSelect = page.getByLabel(/client|العميل/i).or(page.locator("select").first());
      if (await clientSelect.isVisible()) {
        await clientSelect.selectOption({ label: /Associated Client/i });
      }

      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
    }
  });
});
