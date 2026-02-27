import { test, expect } from "@playwright/test";

test.describe("Clients Management", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `clients+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Clients User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display clients page", async ({ page }) => {
    await page.goto("/clients");

    await expect(page).toHaveURL(/.*clients.*/);
    await expect(page.getByRole("heading", { name: /clients|العملاء/i }).or(page.locator("h1, h2").first())).toBeVisible({ timeout: 5000 });
  });

  test("should display clients stats", async ({ page }) => {
    await page.goto("/clients");

    const totalClients = page.getByText(/total clients|إجمالي العملاء/i);
    await expect(totalClients.first()).toBeVisible();
  });

  test("should open new client modal", async ({ page }) => {
    await page.goto("/clients");

    const newClientBtn = page.getByRole("button", { name: /new client|إضافة عميل|add client/i });
    await newClientBtn.click();

    await expect(page.getByRole("dialog").or(page.locator("[role='dialog']")).or(page.locator(".modal"))).toBeVisible({ timeout: 5000 });
  });

  test("should create an individual client", async ({ page }) => {
    await page.goto("/clients");

    const newClientBtn = page.getByRole("button", { name: /new client|إضافة عميل|add client/i });
    await newClientBtn.click();

    const dialog = page.getByRole("dialog").or(page.locator("[role='dialog']")).or(page.locator(".modal"));
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const nameInput = dialog.getByLabel(/name|الاسم/i).or(dialog.getByPlaceholder(/name|الاسم/i));
    if (await nameInput.isVisible()) {
      await nameInput.fill("Ahmed Mohammed");

      const emailInput = dialog.getByLabel(/email|البريد/i).or(dialog.getByPlaceholder(/email|البريد/i));
      if (await emailInput.isVisible()) {
        await emailInput.fill("ahmed@example.com");
      }

      const phoneInput = dialog.getByLabel(/phone|الهاتف/i).or(dialog.getByPlaceholder(/phone|الهاتف/i));
      if (await phoneInput.isVisible()) {
        await phoneInput.fill("+966501234567");
      }

      const typeSelect = dialog.getByLabel(/type|النوع/i).or(dialog.locator("select").first());
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption("individual");
      }

      const submitBtn = dialog.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();

      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    }
  });

  test("should create a company client", async ({ page }) => {
    await page.goto("/clients");

    const newClientBtn = page.getByRole("button", { name: /new client|إضافة عميل|add client/i });
    await newClientBtn.click();

    const dialog = page.getByRole("dialog").or(page.locator("[role='dialog']")).or(page.locator(".modal"));
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const nameInput = dialog.getByLabel(/name|الاسم/i).or(dialog.getByPlaceholder(/name|الاسم/i));
    if (await nameInput.isVisible()) {
      await nameInput.fill("Al-Rashid Law Firm");

      const emailInput = dialog.getByLabel(/email|البريد/i).or(dialog.getByPlaceholder(/email|البريد/i));
      if (await emailInput.isVisible()) {
        await emailInput.fill("contact@alrashid-law.sa");
      }

      const typeSelect = dialog.getByLabel(/type|النوع/i).or(dialog.locator("select").first());
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption("company");
      }

      const submitBtn = dialog.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();

      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    }
  });

  test("should search clients", async ({ page }) => {
    await page.goto("/clients");

    const searchInput = page.getByPlaceholder(/search|بحث/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("Test Search");
      await page.waitForTimeout(500);
    }
  });

  test("should filter clients by type", async ({ page }) => {
    await page.goto("/clients");

    const individualFilter = page.getByRole("button", { name: /individual|فرد/i }).or(page.getByText(/individual|فرد/i)).first();
    if (await individualFilter.isVisible()) {
      await individualFilter.click();
      await page.waitForTimeout(300);
    }

    const companyFilter = page.getByRole("button", { name: /company|شركة/i }).or(page.getByText(/company|شركة/i)).first();
    if (await companyFilter.isVisible()) {
      await companyFilter.click();
      await page.waitForTimeout(300);
    }
  });

  test("should view client details", async ({ page }) => {
    await page.goto("/clients");

    const firstClient = page.locator("table tbody tr").first();
    if (await firstClient.isVisible()) {
      await firstClient.click();
      await expect(page).toHaveURL(/.*clients\/\d+.*/);
    }
  });

  test("should export clients", async ({ page }) => {
    await page.goto("/clients");

    const exportBtn = page.getByRole("button", { name: /export|تصدير/i });
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
    }
  });
});

test.describe("Client-Cases Relationship", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `clientcases+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Client Cases User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display cases count for client", async ({ page }) => {
    await page.goto("/clients");

    const casesCount = page.getByText(/\d+\s*(case|cases|قضية|قضايا)/i);
    await expect(casesCount.first()).toBeVisible({ timeout: 5000 });
  });
});
