// import { chromium } from "playwright";
// import { playAudit } from "playwright-lighthouse";
// import { test as base } from "@playwright/test";
// import getPort from "get-port";

// export const lighthouseTest = base.extend({
//   port: [
//     // biome-ignore lint/correctness/noEmptyPattern: <explanation>
//     async ({ }, use) => {
//       // Assign a unique port for each Playwright worker to support parallel tests
//       const port = await getPort();
//       await use(port);
//     },
//     { scope: "worker" },
//   ],

//   browser: [
//     async ({ port }, use) => {
//       const browser = await chromium.launch({
//         args: [`--remote-debugging-port=${port}`],
//       });
//       await use(browser);
//     },
//     { scope: "worker" },
//   ],
// });

// lighthouseTest.describe("Lighthouse", () => {
//   lighthouseTest(
//     "should pass lighthouse tests",
//     async ({ page, port, browserName }) => {
//       lighthouseTest.skip(
//         browserName !== "chromium",
//         "Test is only applicable to Chromium",
//       );

//       await page.goto(
//         "http://localhost:8080/checkbox-group.html",
//       );
//       await page.waitForSelector("cek-checkbox-group");
//       await playAudit({
//         reports: {
//           formats: {
//             html: true,
//           },
//           name: "lighthouse-results",
//         },
//         page,
//         port,
//       });
//     },
//   );
// });
