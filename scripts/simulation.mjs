import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const p = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://localhost:5173");
await p.getByText("DEMO MODE · SIMULATED SIGNALS", { exact: true }).waitFor();
if ((await p.locator(".sample-signal").count()) !== 4)
  throw Error("Missing sample cards");
if (await p.getByText("Awaiting comparable data", { exact: true }).count())
  throw Error("Empty cards in sample mode");
const first = await p.locator(".sample-stat").allTextContents();
await p.getByRole("button", { name: "NAMA SAYA HASMAH", exact: true }).click();
await p
  .getByRole("heading", { name: "NAMA SAYA HASMAH", level: 2, exact: true })
  .waitFor();
const second = await p.locator(".sample-stat").allTextContents();
if (first.join() === second.join()) throw Error("Sample not book-specific");
if (
  !(await p.locator(".sample-entries").first().textContent()).includes(
    "NAMA SAYA HASMAH",
  )
)
  throw Error("Discussion not synced");
if (await p.locator(".sample-entries a").count())
  throw Error("Fabricated source links");
await p
  .getByRole("button", { name: "Show report data only", exact: true })
  .click();
await p.getByText("Reported catalogue listing", { exact: true }).waitFor();
if (await p.locator(".sample-signal").count())
  throw Error("Overlay not disabled");
await p
  .getByRole("button", { name: "Show sample signals", exact: true })
  .click();
await p
  .getByRole("button", { name: "It Ends With Us (UK)", exact: true })
  .click();
await p.evaluate(()=>scrollTo(0,0));
await p.waitForTimeout(900);
await p.screenshot({
  path: "artifacts/signal-room-desktop.png",
  fullPage: true,
});
await p.setViewportSize({ width: 390, height: 844 });
await p.waitForTimeout(400);
if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
  throw Error("Mobile overflow");
await p.screenshot({
  path: "artifacts/signal-room-mobile.png",
  fullPage: true,
});
if (errors.length) throw Error(errors.join("\n"));
console.log(
  "PASS: sample charts, per-book synchronization, simulated evidence labels, no fabricated links, report-only toggle, desktop and mobile",
);
await browser.close();
