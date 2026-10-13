import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.ts",
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: "http://localhost:4173",
    browserName: "chromium",
    channel: process.env.CI ? "chromium" : "chrome",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run preview -- --listen 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
