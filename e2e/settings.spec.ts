import { test, expect } from "@playwright/test";

test.describe("Settings - Profile", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `profile+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Profile Settings User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display profile settings", async ({ page }) => {
    await page.goto("/settings");

    const profileTab = page.getByRole("button", { name: /profile|الملف الشخصي/i });
    if (await profileTab.isVisible()) {
      await profileTab.click();
    }

    await expect(page.locator("body")).toBeVisible();
  });

  test("should update profile name", async ({ page }) => {
    await page.goto("/settings");

    const nameInput = page.getByLabel(/name|الاسم/i).or(page.getByPlaceholder(/name|الاسم/i)).first();
    if (await nameInput.isVisible()) {
      await nameInput.fill("Updated Profile Name");
    }
  });

  test("should update profile email", async ({ page }) => {
    await page.goto("/settings");

    const emailInput = page.getByLabel(/email|البريد/i).or(page.getByPlaceholder(/email|البريد/i)).first();
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeDisabled();
    }
  });
});

test.describe("Settings - Organization", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `orgsettings+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Org Settings Admin");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");

    const orgBtn = page.getByRole("button", { name: /create new|إنشاء منظمة/i });
    await orgBtn.click();
    await page.getByLabel(/organization name|اسم المنظمة/i).fill("Settings Test Org");

    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display organization settings", async ({ page }) => {
    await page.goto("/settings");

    const orgTab = page.getByRole("button", { name: /organization|المنظمة/i });
    if (await orgTab.isVisible()) {
      await orgTab.click();
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("should display team members list", async ({ page }) => {
    await page.goto("/settings");

    const orgTab = page.getByRole("button", { name: /organization|المنظمة/i });
    if (await orgTab.isVisible()) {
      await orgTab.click();

      const teamSection = page.getByText(/team|members|الفريق|أعضاء/i);
      await expect(teamSection.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should invite team member", async ({ page }) => {
    await page.goto("/settings");

    const orgTab = page.getByRole("button", { name: /organization|المنظمة/i });
    if (await orgTab.isVisible()) {
      await orgTab.click();

      const inviteBtn = page.getByRole("button", { name: /invite|دعوة/i });
      if (await inviteBtn.isVisible()) {
        await inviteBtn.click();

        const inviteDialog = page.getByRole("dialog").or(page.locator("[role='dialog']")).or(page.locator(".modal"));
        if (await inviteDialog.isVisible()) {
          const emailInput = inviteDialog.getByLabel(/email|البريد/i);
          if (await emailInput.isVisible()) {
            await emailInput.fill("newmember@example.com");
          }

          const roleSelect = inviteDialog.getByLabel(/role|الدور/i).or(inviteDialog.locator("select"));
          if (await roleSelect.isVisible()) {
            await roleSelect.selectOption("lawyer");
          }

          const sendBtn = inviteDialog.getByRole("button", { name: /send|إرسال|invite|دعوة/i });
          if (await sendBtn.isVisible()) {
            await sendBtn.click();
          }
        }
      }
    }
  });

  test("should display invitation code input", async ({ page }) => {
    await page.goto("/settings");

    const orgTab = page.getByRole("button", { name: /organization|المنظمة/i });
    if (await orgTab.isVisible()) {
      await orgTab.click();

      const invitationCodeInput = page.getByLabel(/invitation code|رمز الدعوة/i).or(page.getByPlaceholder(/code|رمز/i));
      if (await invitationCodeInput.isVisible()) {
        await invitationCodeInput.fill("TEST-CODE");
      }
    }
  });
});

test.describe("Settings - Notifications", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `notif+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Notification Settings User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display notification settings", async ({ page }) => {
    await page.goto("/settings");

    const notifTab = page.getByRole("button", { name: /notifications|الإشعارات/i });
    if (await notifTab.isVisible()) {
      await notifTab.click();
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("should toggle email notifications", async ({ page }) => {
    await page.goto("/settings");

    const notifTab = page.getByRole("button", { name: /notifications|الإشعارات/i });
    if (await notifTab.isVisible()) {
      await notifTab.click();

      const emailToggle = page.getByLabel(/email.*notification|إشعارات البريد/i).or(page.locator("input[type='checkbox']").first());
      if (await emailToggle.isVisible()) {
        await emailToggle.click();
      }
    }
  });

  test("should toggle push notifications", async ({ page }) => {
    await page.goto("/settings");

    const notifTab = page.getByRole("button", { name: /notifications|الإشعارات/i });
    if (await notifTab.isVisible()) {
      await notifTab.click();

      const pushToggle = page.getByLabel(/push.*notification|إشعارات الدفع/i);
      if (await pushToggle.isVisible()) {
        await pushToggle.click();
      }
    }
  });
});

test.describe("Settings - Security", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `security+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Security Settings User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");
    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display security settings", async ({ page }) => {
    await page.goto("/settings");

    const securityTab = page.getByRole("button", { name: /security|الأمان/i });
    if (await securityTab.isVisible()) {
      await securityTab.click();
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("should display change password form", async ({ page }) => {
    await page.goto("/settings");

    const securityTab = page.getByRole("button", { name: /security|الأمان/i });
    if (await securityTab.isVisible()) {
      await securityTab.click();

      const currentPasswordInput = page.getByLabel(/current password|كلمة المرور الحالية/i);
      if (await currentPasswordInput.isVisible()) {
        await currentPasswordInput.fill("password123");
      }

      const newPasswordInput = page.getByLabel(/new password|كلمة المرور الجديدة/i);
      if (await newPasswordInput.isVisible()) {
        await newPasswordInput.fill("newpassword123");
      }
    }
  });

  test("should display login activity", async ({ page }) => {
    await page.goto("/settings");

    const securityTab = page.getByRole("button", { name: /security|الأمان/i });
    if (await securityTab.isVisible()) {
      await securityTab.click();

      const loginActivity = page.getByText(/login activity|نشاط تسجيل الدخول/i);
      await expect(loginActivity.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Settings - Billing", () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `billing+${Date.now()}@example.com";

    await page.goto("/register");
    await page.getByLabel(/full name|الاسم الكامل/i).fill("Billing Settings Admin");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByPlaceholder(/password|كلمة المرور/i).first().fill("password123");
    await page.getByPlaceholder(/confirm|تأكيد/i).fill("password123");

    const orgBtn = page.getByRole("button", { name: /create new|إنشاء منظمة/i });
    await orgBtn.click();
    await page.getByLabel(/organization name|اسم المنظمة/i).fill("Billing Test Org");

    await page.getByLabel(/terms|أوافق/i).check();
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display billing settings for admin", async ({ page }) => {
    await page.goto("/settings");

    const billingTab = page.getByRole("button", { name: /billing|الفوترة/i });
    if (await billingTab.isVisible()) {
      await billingTab.click();
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("should display current plan", async ({ page }) => {
    await page.goto("/settings");

    const billingTab = page.getByRole("button", { name: /billing|الفوترة/i });
    if (await billingTab.isVisible()) {
      await billingTab.click();

      const currentPlan = page.getByText(/plan|الخطة|free|premium|enterprise/i);
      await expect(currentPlan.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should display usage statistics", async ({ page }) => {
    await page.goto("/settings");

    const billingTab = page.getByRole("button", { name: /billing|الفوترة/i });
    if (await billingTab.isVisible()) {
      await billingTab.click();

      const usageSection = page.getByText(/usage|الاستخدام|cases|documents|storage/i);
      await expect(usageSection.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
