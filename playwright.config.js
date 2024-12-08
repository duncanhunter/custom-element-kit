import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./src",
	testMatch: /.*\.e2e.js/,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [
		["html", { outputFolder: "./test-results/reports/", open: "never" }],
	],
	use: {
		baseURL: "http://localhost:8080",
		trace: "on-first-retry",
	},
	outputDir: "./test-results/results",
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
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
	],
});
