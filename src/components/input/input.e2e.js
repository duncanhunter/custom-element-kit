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

test("given validated input on change with validate-on-change attribute should show error on change", async ({
	page,
}) => {
	await page.goto("/input.html");
	const postalCode = await page.locator("cek-input[label='Postal Code']");
	const postalCodeInput = await page.locator(
		"cek-input[label='Postal Code'] input",
	);
	await postalCodeInput.fill("123"); // Invalid pattern
	const validationMessage = await postalCode.evaluate(
		(element) => element.validationMessage,
	);
	expect(validationMessage).toBe("Please enter a valid 4-digit postal code");
});

test("given different sizes should have different heights", async ({
	page,
}) => {
	await page.goto("/input.html");

	const smallInput = await page.locator("cek-input[size='small']");
	const mediumInput = await page.locator("cek-input[size='medium']");
	const largeInput = await page.locator("cek-input[size='large']");

	const smallHeight = await smallInput.evaluate(
		(el) => getComputedStyle(el).height,
	);
	const mediumHeight = await mediumInput.evaluate(
		(el) => getComputedStyle(el).height,
	);
	const largeHeight = await largeInput.evaluate(
		(el) => getComputedStyle(el).height,
	);

	expect(smallHeight).toBe("44px");
	expect(mediumHeight).toBe("58px");
	expect(largeHeight).toBe("69px");
});

test("given toggle password button click it should toggle the type", async ({
	page,
}) => {
	await page.goto("/input.html");

	const passwordInput = await page.locator("cek-input#password-input");
	const toggleButton = passwordInput.locator(
		"cek-button[command='toggle-password']",
	);

	let inputType = await passwordInput.evaluate((element) =>
		element.getAttribute("type"),
	);
	expect(inputType).toBe("password");

	await toggleButton.click();
	inputType = await passwordInput.evaluate((element) =>
		element.getAttribute("type"),
	);
	expect(inputType).toBe("text");

	await toggleButton.click();
	inputType = await passwordInput.evaluate((element) =>
		element.getAttribute("type"),
	);
	expect(inputType).toBe("password");
});

test("given clear button click it should clear the input", async ({ page }) => {
	await page.goto("/input.html");

	const state = await page.locator("cek-input[label='State']");
	const stateInput = state.locator("input");
	await stateInput.fill("NSW");
	const clearButton = await page.locator("cek-button[command='clear'] button");

	await clearButton.click({ force: true });
	const inputValue = await stateInput.evaluate((element) => element.value);
	expect(inputValue).toBe("");
});

test("given submit of a valid for the form data should be populated", async ({
	page,
}) => {
	await page.goto("/input.html");

	await page.evaluate(() => {
		const form = document.querySelector("form");
		form.addEventListener(
			"submit",
			(event) => {
				event.preventDefault();
				const fd = new FormData(form);
				window._capturedFormData = Array.from(fd.entries());
			},
			{ once: true },
		);
	});

	const emailInput = await page.locator(
		"cek-input[label='Email Address'] input",
	);
	await emailInput.fill("user@example.com");

	const postalCodeInput = await page.locator(
		"cek-input[label='Postal Code'] input",
	);
	await postalCodeInput.fill("1234");

	const submitButton = await page.locator("button[type=submit]");
	await submitButton.click({ force: true });

	const capturedData = await page.evaluate(() => window._capturedFormData);

	expect(capturedData).toContainEqual(["email", "user@example.com"]);
	expect(capturedData).toContainEqual(["postcode", "1234"]);
});
