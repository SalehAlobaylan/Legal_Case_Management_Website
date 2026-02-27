import { test, expect } from "@playwright/test";

test.describe("Complete User Journey", () => {
  test("full registration to case management flow", async ({ page }) => {
    const uniqueEmail = `journey+${Date.now()}@example.com`;

    await page.goto("/");
    await expect(page).toHaveTitle(/Legal|Silah/i);

    await page.getByRole("link", { name: /register|sign up|create account/i }).first().click();
    await expect(page).toHaveURL(/.*register.*/);

    await page.getByLabel(/full name|الاسم الكامل/i).fill("Journey User");
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

    const clientNameInput = dialog.getByLabel(/name|الاسم/i).or(dialog.getByPlaceholder(/name|الاسم/i));
    if (await clientNameInput.isVisible()) {
      await clientNameInput.fill("Journey Client");
      const submitBtn = dialog.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    }

    await page.goto("/cases/new");

    const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
    if (await titleInput.isVisible()) {
      await titleInput.fill("Journey Test Case");

      const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
      if (await caseNumberInput.isVisible()) {
        await caseNumberInput.fill(`JRN-${Date.now()}`);
      }

      const submitBtn = page.getByRole("button", { name: /create|save|إضافة|حفظ/i });
      await submitBtn.click();
      await expect(page).toHaveURL(/.*cases.*/, { timeout: 10000 });
    }

    await page.goto("/regulations");
    await expect(page).toHaveURL(/.*regulations.*/);

    await page.goto("/alerts");
    await expect(page).toHaveURL(/.*alerts.*/);

    await page.goto("/profile");
    await expect(page).toHaveURL(/.*profile.*/);

    await page.goto("/settings");
    await expect(page).toHaveURL(/.*settings.*/);
  });

  test("login after registration flow", async ({ page }) => {
    const uniqueEmail = `loginflow+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Login Flow User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    await page.context().clearCookies();
    await page.goto("/login");

    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 10000 });
  });
});

test.describe("Organization Registration Flow", () => {
  test("create organization and manage team", async ({ page }) => {
    const uniqueEmail = `org+${Date.now()}@example.com`;

    await page.goto("/register");

    await page.getByLabel(/full name|الاسم الكامل/i).fill("Org Admin");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");

    const orgBtn = page.getByRole("button", { name: /create new|إنشاء منظمة/i });
    await orgBtn.click();

    await page.getByLabel(/organization name|اسم المنظمة/i).fill("Test Law Firm LLC");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    await page.goto("/settings");
    await expect(page).toHaveURL(/.*settings.*/);
  });
});

test.describe("Data Management Flow", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `data+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Data Management User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should create multiple clients", async ({ page }) => {
    await page.goto("/clients");

    for (let i = 1; i <= 3; i++) {
      const newClientBtn = page.getByRole("button", { name: /new client|إضافة عميل/i });
      await newClientBtn.click();

      const dialog = page.getByRole("dialog").or(page.locator("[role='dialog']")).or(page.locator(".modal"));
      await expect(dialog).toBeVisible({ timeout: 5000 });

      const nameInput = dialog.getByLabel(/name|الاسم/i).or(dialog.getByPlaceholder(/name|الاسم/i));
      if (await nameInput.isVisible()) {
        await nameInput.fill(`Test Client ${i}`);
        const submitBtn = dialog.getByRole("button", { name: /create|save|إضافة|حفظ/i });
        await submitBtn.click();
        await expect(dialog).not.toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should create multiple cases", async ({ page }) => {
    const caseTypes = ["criminal", "civil", "commercial"];

    for (const type of caseTypes) {
      await page.goto("/cases/new");

      const titleInput = page.getByLabel(/title|العنوان/i).or(page.getByPlaceholder(/title|العنوان/i));
      if (await titleInput.isVisible()) {
        await titleInput.fill(`${type.charAt(0).toUpperCase() + type.slice(1)} Case`);

        const caseNumberInput = page.getByLabel(/case number|رقم القضية/i).or(page.getByPlaceholder(/case number|رقم القضية/i));
        if (await caseNumberInput.isVisible()) {
          await caseNumberInput.fill(`${type.toUpperCase()}-${Date.now()}`);
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
});

test.describe("Error Handling", () => {
  test("should handle duplicate email registration", async ({ page }) => {
    const uniqueEmail = `duplicate+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("First User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    await page.context().clearCookies();
    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Second User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/exists|موجد|already|error/i)).toBeVisible({ timeout: 5000 });
  });

  test("should handle wrong password login", async ({ page }) => {
    const uniqueEmail = `wrongpass+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Wrong Pass User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).click();

    await expect(page.getByText(/invalid|incorrect|خطأ|غير صحيح|error/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Responsive Design", () => {
  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const uniqueEmail = `mobile+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Mobile User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    await page.goto("/cases");
    await expect(page).toHaveURL(/.*cases.*/);
  });

  test("should work on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const uniqueEmail = `tablet+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Tablet User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });
});
