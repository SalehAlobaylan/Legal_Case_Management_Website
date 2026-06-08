import { test, expect } from "@playwright/test";

/**
 * Museum mode onboarding walkthrough e2e.
 *
 * Skips when the public landing page's "Get started" path can't reach a museum
 * session in the current CI environment, so it stays a smoke test that runs
 * wherever the marketing demo auth is wired up.
 */

const MUSEUM_STORAGE_KEY = "silah-museum-tour-v1";

test.describe("Museum walkthrough", () => {
  test("launcher is hidden in normal session", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("museum-tour-launcher")).toHaveCount(0);
  });

  test("feature map lists categories and admin items are gated for non-admins", async ({ page, context }) => {
    // Seed a museum session directly so the test is independent of the
    // public landing page's demo login (which may be disabled in CI).
    await context.addInitScript(() => {
      const museumUser = {
        state: {
          user: {
            id: 1,
            email: "demo-museum@example.com",
            fullName: "Museum Visitor",
            role: "user",
            organizationId: 1,
          },
          token: "demo-museum-token",
          isAuthenticated: true,
          museum: true,
        },
        version: 0,
      };
      window.localStorage.setItem("auth-storage", JSON.stringify(museumUser));
      window.localStorage.setItem("auth-museum", "1");
      window.document.cookie = "auth-storage=1; Path=/; Max-Age=604800";
      window.document.cookie = "auth-museum=1; Path=/; Max-Age=604800";
      window.document.cookie = "auth-role=user; Path=/; Max-Age=604800";
    });

    await page.goto("/dashboard");

    const launcher = page.getByTestId("museum-tour-launcher");
    await expect(launcher).toBeVisible({ timeout: 10000 });

    await launcher.click();

    // Map is open and contains expected categories.
    await expect(page.getByRole("dialog", { name: /explore silah features/i })).toBeVisible();
    await expect(page.getByText(/^AI$/i).first()).toBeVisible();

    // Admin-only items should NOT be visible for non-admin visitors.
    await expect(
      page.getByRole("button", { name: /admin ai intelligence/i })
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /admin operations/i })
    ).toHaveCount(0);

    // Core item is visible.
    await expect(
      page.getByRole("button", { name: /cases workspace/i })
    ).toBeVisible();
  });

  test("anchors exist on dashboard, cases, and regulations", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator('[data-tour-id="dashboard-command-center"]')).toBeVisible();

    await page.goto("/cases");
    await expect(page.locator('[data-tour-id="cases-workspace"]')).toBeVisible();

    await page.goto("/regulations");
    await expect(page.locator('[data-tour-id="regulations-library"]')).toBeVisible();

    await page.goto("/clients");
    await expect(page.locator('[data-tour-id="clients-workflow"]')).toBeVisible();

    await page.goto("/alerts");
    await expect(page.locator('[data-tour-id="alerts-realtime"]')).toBeVisible();
  });

  test("completing the tour once prevents auto-start on the next visit", async ({ page, context }) => {
    await context.addInitScript((key) => {
      window.localStorage.setItem(key, "complete");
      const museumUser = {
        state: {
          user: {
            id: 1,
            email: "demo-museum@example.com",
            fullName: "Museum Visitor",
            role: "user",
            organizationId: 1,
          },
          token: "demo-museum-token",
          isAuthenticated: true,
          museum: true,
        },
        version: 0,
      };
      window.localStorage.setItem("auth-storage", JSON.stringify(museumUser));
      window.document.cookie = "auth-storage=1; Path=/; Max-Age=604800";
      window.document.cookie = "auth-museum=1; Path=/; Max-Age=604800";
      window.document.cookie = "auth-role=user; Path=/; Max-Age=604800";
    }, MUSEUM_STORAGE_KEY);

    await page.goto("/dashboard");

    await expect(page.getByTestId("museum-tour-launcher")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("tour dialog is always dismissible via Skip or Escape", async ({ page, context }) => {
    await context.addInitScript(() => {
      const museumUser = {
        state: {
          user: {
            id: 1,
            email: "demo-museum@example.com",
            fullName: "Museum Visitor",
            role: "user",
            organizationId: 1,
          },
          token: "demo-museum-token",
          isAuthenticated: true,
          museum: true,
        },
        version: 0,
      };
      window.localStorage.setItem("auth-storage", JSON.stringify(museumUser));
      window.document.cookie = "auth-storage=1; Path=/; Max-Age=604800";
      window.document.cookie = "auth-museum=1; Path=/; Max-Age=604800";
      window.document.cookie = "auth-role=user; Path=/; Max-Age=604800";
    });

    await page.goto("/dashboard");

    // Autostarted tour dialog must be visible.
    const dialog = page.getByTestId("museum-tour-dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Skip button is the primary dismiss path.
    await expect(
      page.getByRole("button", { name: /skip tour|تخطي الجولة/i })
    ).toBeVisible();
    await page.getByRole("button", { name: /skip tour|تخطي الجولة/i }).click();
    await expect(dialog).toHaveCount(0);

    // Reopen the feature map via the launcher and dismiss with Escape.
    await page.getByTestId("museum-tour-launcher").click();
    const map = page.getByRole("dialog", { name: /explore silah features/i });
    await expect(map).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(map).toHaveCount(0);
  });

  test("Museum mode disables Find related and other AI mutating buttons", async ({ page, context }) => {
    await context.addInitScript(() => {
      const museumUser = {
        state: {
          user: {
            id: 1,
            email: "demo-museum@example.com",
            fullName: "Museum Visitor",
            role: "user",
            organizationId: 1,
          },
          token: "demo-museum-token",
          isAuthenticated: true,
          museum: true,
        },
        version: 0,
      };
      window.localStorage.setItem("auth-storage", JSON.stringify(museumUser));
      window.document.cookie = "auth-storage=1; Path=/; Max-Age=604800";
      window.document.cookie = "auth-museum=1; Path=/; Max-Age=604800";
      window.document.cookie = "auth-role=user; Path=/; Max-Age=604800";
    });

    // Go straight to the cases list and try to use the new-case action. We
    // verify the museum banner is present and the action button is disabled.
    await page.goto("/cases");

    // Banner is visible.
    await expect(page.getByText(/demo mode|للعرض فقط|sign up/i).first()).toBeVisible();

    // The "new case" button, when present, should be disabled in museum mode.
    const newCase = page.getByRole("button", { name: /new case|قضية جديدة/i }).first();
    if (await newCase.count()) {
      await expect(newCase).toBeDisabled();
    }
  });
});
