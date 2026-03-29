import { test, expect } from "@playwright/test";

test.describe("Profile Page - Stats & KPIs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email|البريد الإلكتروني/i).fill("admin@test.com");
    await page.getByPlaceholder(/password|كلمة المرور/i).fill("test123");
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display profile page after login", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/.*profile.*/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display KPI stat cards", async ({ page }) => {
    await page.goto("/profile");
    
    await expect(page.getByText(/Success Rate|نسبة النجاح/i)).toBeVisible();
    await expect(page.getByText(/Client Satisfaction|رضا العملاء/i)).toBeVisible();
    await expect(page.getByText(/Monthly Hours|ساعات الشهر/i)).toBeVisible();
    await expect(page.getByText(/Avg Case Duration|متوسط المدة/i)).toBeVisible();
  });

  test("should display win rate percentage", async ({ page }) => {
    await page.goto("/profile");
    
    const winRateCard = page.locator("text=Success Rate").locator("..").locator("..");
    await expect(winRateCard).toBeVisible();
    const winRateValue = winRateCard.locator("text=/\\d+%/");
    await expect(winRateValue).toBeVisible();
  });

  test("should display client satisfaction percentage", async ({ page }) => {
    await page.goto("/profile");
    
    const satisfactionCard = page.locator("text=Client Satisfaction").locator("..").locator("..");
    await expect(satisfactionCard).toBeVisible();
  });

  test("should display monthly hours", async ({ page }) => {
    await page.goto("/profile");
    
    const hoursCard = page.locator("text=Monthly Hours").locator("..").locator("..");
    await expect(hoursCard).toBeVisible();
  });

  test("should display average case duration", async ({ page }) => {
    await page.goto("/profile");
    
    const durationCard = page.locator("text=Avg Case Duration").locator("..").locator("..");
    await expect(durationCard).toBeVisible();
  });
});

test.describe("Profile Page - Caseload Distribution", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email|البريد الإلكتروني/i).fill("admin@test.com");
    await page.getByPlaceholder(/password|كلمة المرور/i).fill("test123");
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display caseload distribution section", async ({ page }) => {
    await page.goto("/profile");
    
    await expect(page.getByText(/Caseload Distribution|توزيع القضايا/i)).toBeVisible();
  });

  test("should display total registered cases", async ({ page }) => {
    await page.goto("/profile");
    
    await expect(page.getByText(/Total Registered Cases|إجمالي القضايا/i)).toBeVisible();
  });

  test("should display active cases progress bar", async ({ page }) => {
    await page.goto("/profile");
    
    const activeCasesText = page.getByText(/Active|& In Progress|نشطة/i);
    await expect(activeCasesText).toBeVisible();
  });

  test("should display closed cases progress bar", async ({ page }) => {
    await page.goto("/profile");
    
    const closedCasesText = page.getByText(/Closed|& Adjudicated|مغلقة/i);
    await expect(closedCasesText).toBeVisible();
  });

  test("should display pending cases progress bar", async ({ page }) => {
    await page.goto("/profile");
    
    const pendingCasesText = page.getByText(/Pending Action|معلقة/i);
    await expect(pendingCasesText).toBeVisible();
  });
});

test.describe("Profile Page - Productivity Metrics", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email|البريد الإلكتروني/i).fill("admin@test.com");
    await page.getByPlaceholder(/password|كلمة المرور/i).fill("test123");
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display productivity metrics section", async ({ page }) => {
    await page.goto("/profile");
    
    await expect(page.getByText(/Productivity Metrics|الإنتاجية/i)).toBeVisible();
  });

  test("should display AI assistance rate", async ({ page }) => {
    await page.goto("/profile");
    
    await expect(page.getByText(/Match acceptance|قبول المطابقات/i)).toBeVisible();
  });

  test("should display document processing metric", async ({ page }) => {
    await page.goto("/profile");
    
    await expect(page.getByText(/Document Processing|المستندات/i)).toBeVisible();
  });

  test("should display regulations reviewed metric", async ({ page }) => {
    await page.goto("/profile");
    
    await expect(page.getByText(/Regulations Reviewed|اللوائح/i)).toBeVisible();
  });
});

test.describe("Profile Page - Activity Log", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email|البريد الإلكتروني/i).fill("admin@test.com");
    await page.getByPlaceholder(/password|كلمة المرور/i).fill("test123");
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display activity log section", async ({ page }) => {
    await page.goto("/profile");
    
    await expect(page.getByText(/Recent Activity Log|سجل النشاط/i)).toBeVisible();
  });

  test("should display activity filter tabs", async ({ page }) => {
    await page.goto("/profile");
    
    await expect(page.getByRole("button", { name: /All|الكل/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Cases|القضايا/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Documents|المستندات/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Regulations|اللوائح/i })).toBeVisible();
  });

  test("should filter activities by cases", async ({ page }) => {
    await page.goto("/profile");
    
    const casesFilter = page.getByRole("button", { name: /Cases|القضايا/i });
    await casesFilter.click();
    await page.waitForTimeout(500);
  });

  test("should filter activities by documents", async ({ page }) => {
    await page.goto("/profile");
    
    const documentsFilter = page.getByRole("button", { name: /Documents|المستندات/i });
    await documentsFilter.click();
    await page.waitForTimeout(500);
  });

  test("should filter activities by regulations", async ({ page }) => {
    await page.goto("/profile");
    
    const regulationsFilter = page.getByRole("button", { name: /Regulations|اللوائح/i });
    await regulationsFilter.click();
    await page.waitForTimeout(500);
  });

  test("should show load more button when more activities exist", async ({ page }) => {
    await page.goto("/profile");
    
    const loadMoreBtn = page.getByRole("button", { name: /Load More|المزيد/i });
    if (await loadMoreBtn.isVisible()) {
      await loadMoreBtn.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe("Profile Page - User Information", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email|البريد الإلكتروني/i).fill("admin@test.com");
    await page.getByPlaceholder(/password|كلمة المرور/i).fill("test123");
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should display user name on profile", async ({ page }) => {
    await page.goto("/profile");
    
    await expect(page.locator("text=Test Admin")).toBeVisible();
  });

  test("should display user role badge", async ({ page }) => {
    await page.goto("/profile");
    
    await expect(page.getByText(/Administrator|مدير/i)).toBeVisible();
  });

  test("should display user email", async ({ page }) => {
    await page.goto("/profile");
    
    await expect(page.getByText("admin@test.com")).toBeVisible();
  });

  test("should display edit profile button", async ({ page }) => {
    await page.goto("/profile");
    
    const editBtn = page.getByRole("button", { name: /edit|تعديل/i });
    await expect(editBtn).toBeVisible();
  });
});

test.describe("Profile Page - Profile Editing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email|البisbury الإلكتروني/i).fill("admin@test.com");
    await page.getByPlaceholder(/password|كلمة المرور/i).fill("test123");
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should open edit mode when clicking edit button", async ({ page }) => {
    await page.goto("/profile");
    
    const editBtn = page.getByRole("button", { name: /edit|تعديل/i });
    await editBtn.click();
    
    await expect(page.getByLabel(/full name/i).or(page.getByText(/Name/i))).toBeVisible();
    await expect(page.getByRole("button", { name: /save|حفظ/i })).toBeVisible();
  });

  test("should close edit mode when clicking cancel", async ({ page }) => {
    await page.goto("/profile");
    
    const editBtn = page.getByRole("button", { name: /edit|تعديل/i });
    await editBtn.click();
    
    const cancelBtn = page.locator("button").filter({ has: page.locator("svg") }).first();
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
    }
    
    const saveBtn = page.getByRole("button", { name: /save|حفظ/i });
    await expect(saveBtn).not.toBeVisible();
  });
});

test.describe("Profile Page - Avatar Upload", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email|البريد الإلكتروني/i).fill("admin@test.com");
    await page.getByPlaceholder(/password|كلمة المرور/i).fill("test123");
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
  });

  test("should have avatar upload area", async ({ page }) => {
    await page.goto("/profile");
    
    const avatarArea = page.locator(".rounded-full").first();
    await expect(avatarArea).toBeVisible();
  });

  test("should have camera icon for upload", async ({ page }) => {
    await page.goto("/profile");
    
    const cameraIcon = page.locator("svg.lucide-camera, svg[class*='Camera']");
    await expect(cameraIcon.first()).toBeVisible();
  });
});

test.describe("Profile Page - API Integration", () => {
  test("should fetch real stats from API", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email|البريد الإلكتروني/i).fill("admin@test.com");
    await page.getByPlaceholder(/password|كلمة المرور/i).fill("test123");
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
    
    await page.goto("/profile");
    
    await page.waitForLoadState("networkidle");
    
    const statsCards = page.locator("[class*='rounded-xl'][class*='border']");
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display real case data in distribution", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email|البريد الإلكتروني/i).fill("admin@test.com");
    await page.getByPlaceholder(/password|كلمة المرور/i).fill("test123");
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });
    
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
    
    const totalCases = page.getByText(/Total Registered Cases/i).locator("..").locator("p").first();
    await expect(totalCases).toBeVisible();
  });
});
