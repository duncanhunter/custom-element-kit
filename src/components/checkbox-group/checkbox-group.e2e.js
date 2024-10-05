import { expect, test } from "@playwright/test";

test("given checkbox group it should submit with error", async ({
	browser,
}) => {
	const context = await browser.newContext({ hasTouch: true });
	const page = await context.newPage();

	await page.goto("/components/checkbox-group/checkbox-group.html");
	await page.getByText("Submit").click();
	const customElement = await page.locator("ui-checkbox-group");
	const validityMessage = await customElement.evaluate(
		(element) => element.validationMessage,
	);

	expect(validityMessage).toBe("Select at least 4 options.");
	await expect(customElement).toHaveScreenshot();
});
