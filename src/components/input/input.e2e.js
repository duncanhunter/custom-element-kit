import { expect, test } from "@playwright/test";

test("given input with  default value clering it and should submit with an error.", async ({
	browser,
}) => {
	const context = await browser.newContext({ hasTouch: true });
	const page = await context.newPage();

	await page.goto("/input.html");
	await page.getByText("Submit & validate").click();
	const inputElement = await page.locator("cek-input[label='Email Address']");
	await inputElement.evaluate((element) => {
		element.value = "";
	});
	const submitButton = await page.locator("button[type=submit]");
	await submitButton.click();

	const validityMessage = await inputElement.evaluate(
		(element) => element.validationMessage,
	);

	expect(validityMessage).toBe("Email address is required");
});
