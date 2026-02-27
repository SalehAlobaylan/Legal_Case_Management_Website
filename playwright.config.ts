import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

const isCI = !!process.env.CI;
const useExistingServers = isCI || process.env.PLAYWRIGHT_USE_EXISTING_SERVERS === "true";

loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [["html"], ["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    ...(isCI
      ? []
      : [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
          },
          {
            name: "Mobile Chrome",
            use: { ...devices["Pixel 5"] },
          },
          {
            name: "Mobile Safari",
            use: { ...devices["iPhone 12"] },
          },
        ]),
  ],
  ...(useExistingServers
    ? {}
    : {
        webServer: {
          command: "npm run dev",
          url: "http://localhost:3001",
          reuseExistingServer: true,
          timeout: 120 * 1000,
        },
      }),
});
