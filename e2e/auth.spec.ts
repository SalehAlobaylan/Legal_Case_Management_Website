import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should display landing page with navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Legal|Silah/i);

    const loginLink = page.getByRole("link", { name: /login|sign in/i });
    await expect(loginLink).toBeVisible();

    const registerLink = page.getByRole("link", { name: /register|sign up|create account/i });
    await expect(registerLink).toBeVisible();
  });

  test("should register a new user with personal account", async ({ page }) => {
    const uniqueEmail = `personal+${Date.now()}@example.com`;

    await page.goto("/register");

    await page.getByLabel(/full name|الاسم الكامل/i).fill("Personal Test User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");

    const personalBtn = page.getByRole("button", { name: /personal|حساب شخصي/i });
    await personalBtn.click();

    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard|.*login.*/, { timeout: 15000 });
  });

  test("should register a new user with organization", async ({ page }) => {
    const uniqueEmail = `org+${Date.now()}@example.com";

    await page.goto("/register");

    await page.getByLabel(/full name|الاسم الكامل/i).fill("Org Admin User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");

    const orgBtn = page.getByRole("button", { name: /create new|إنشاء منظمة/i });
    await orgBtn.click();

    await page.getByLabel(/organization name|اسم المنظمة/i).fill("Test Law Firm");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard|.*login.*/, { timeout: 15000 });
  });

  test("should validate registration form", async ({ page }) => {
    await page.goto("/register");

    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/required|must be at least/i).first()).toBeVisible();

    await page.getByLabel(/email/i).fill("invalid-email");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/invalid email/i)).toBeVisible();

    await page.getByLabel(/email/i).fill("valid@example.com");
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("short");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("short");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/at least 8 characters|8 أحرف/i)).toBeVisible();

    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("different123");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/do not match|غير متطابقة/i)).toBeVisible();
  });

  test("should login with valid credentials", async ({ page }) => {
    const uniqueEmail = `login+${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Login Test User");
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

  test("should show error for invalid login credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("nonexistent@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword123");
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).click();

    await expect(page.getByText(/invalid|incorrect|خطأ|غير صحيح|error/i)).toBeVisible({ timeout: 5000 });
  });

  test("should navigate between login and register pages", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: /create.*account|إنشاء حساب/i }).click();
    await expect(page).toHaveURL(/.*register.*/);

    await page.getByRole("link", { name: /sign in|تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/.*login.*/);
  });
});

test.describe("Protected Routes", () => {
  test("should redirect unauthenticated users to login", async ({ page }) => {
    const protectedRoutes = ["/dashboard", "/cases", "/clients", "/regulations", "/alerts", "/profile", "/settings"];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/.*login.*/, { timeout: 5000 });
    }
  });
});
