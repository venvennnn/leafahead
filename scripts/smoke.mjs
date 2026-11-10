import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:5173/?demo=1");
await page.waitForTimeout(2000);
await page.screenshot({
  path: "artifacts/signal-room-desktop.png",
  fullPage: true,
});
await page.getByRole("button", { name: "The Red Hill", exact: true }).click();
await page
  .getByRole("heading", { name: "The Red Hill", exact: true })
  .waitFor();
await page.getByRole("button", { name: "Shortlist", exact: true }).click();
await page.reload();
await page.getByRole("button", { name: "The Red Hill", exact: true }).click();
await page.getByRole("button", { name: "Shortlisted", exact: true }).waitFor();
await page.getByRole("link", { name: "Book Radar", exact: true }).click();
await page.getByLabel("Signal filter").selectOption("saved");
if ((await page.locator(".radar-grid article").count()) !== 1)
  throw Error("shortlist filter");
await page.getByRole("link", { name: "Signal Room", exact: true }).click();
await page
  .getByRole("button", { name: "Beneath the Rubber Trees", exact: true })
  .click();
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(700);
await page.screenshot({
  path: "artifacts/signal-room-mobile.png",
  fullPage: true,
});
if (
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
)
  throw Error("mobile overflow");
await page.goto("http://localhost:5173/?demo=1&fallback=1");
await page.locator(".fallback-shelf button").first().click();
await page
  .getByRole("heading", { name: "The Red Hill", exact: true })
  .waitFor();
console.log(
  JSON.stringify({
    errors,
    checks: [
      "selection synchronization",
      "shortlist persistence",
      "shortlist filter",
      "mobile overflow",
      "2D fallback",
    ],
  }),
);
await browser.close();
