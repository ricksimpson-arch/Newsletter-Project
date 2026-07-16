import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. The remote build environment pre-installs Chromium at
 * /opt/pw-browsers/chromium; locally, remove `executablePath` (or run
 * `npx playwright install chromium`) to use the managed browser.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3111",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { executablePath },
      },
    },
  ],
  webServer: {
    command: "npm start -- -p 3111",
    url: "http://localhost:3111",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
