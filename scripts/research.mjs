import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://localhost:5173/?evidence=real");
await p
  .getByRole("heading", { name: "It Ends With Us (UK)", exact: true, level: 2 })
  .waitFor();
await p.getByText("Reported catalogue listing", { exact: true }).waitFor();
if ((await p.locator(".title-list button").count()) !== 22)
  throw Error("Expected 22 research titles");
await p
  .getByRole("button", {
    name: "Turath - Kusangkakan Pahala Rupanya Dosa (2026)",
    exact: true,
  })
  .click();
await p
  .getByRole("heading", {
    level: 2,
    name: "Turath - Kusangkakan Pahala Rupanya Dosa (2026)",
    exact: true,
  })
  .waitFor();
await p
  .getByRole("button", { name: "It Ends With Us (UK)", exact: true })
  .click();
await p.waitForTimeout(800);
await p.screenshot({
  path: "artifacts/signal-room-desktop.png",
  fullPage: true,
});
await p.setViewportSize({ width: 390, height: 844 });
await p.waitForTimeout(500);
if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
  throw Error("Mobile overflow");
await p.screenshot({
  path: "artifacts/signal-room-mobile.png",
  fullPage: true,
});
await p.getByRole("link", { name: "Book Radar", exact: true }).click();
await p
  .getByRole("heading", { name: "Book Radar", exact: true, level: 1 })
  .waitFor();
if ((await p.locator(".radar-grid article").count()) !== 22)
  throw Error("Radar count");
await p.getByLabel("Signal filter").selectOption("catalogue");
if ((await p.locator(".radar-grid article").count()) !== 22)
  throw Error("Catalogue filter");
await p.getByRole("link", { name: "Releases", exact: true }).click();
await p
  .getByRole("heading", { name: "Releases", exact: true, level: 1 })
  .waitFor();
if ((await p.locator("tbody tr").count()) !== 17) throw Error("Release count");
await p
  .getByRole("cell", { name: "2026-11-10 Report-supplied date", exact: true })
  .waitFor();
if (
  (await p
    .locator("tbody")
    .getByText("9786294931824", { exact: true })
    .count()) !== 1
)
  throw Error("ISBN mismatch");
await p.getByRole("link", { name: "Monthly Brief", exact: true }).click();
await p.getByLabel("Reporting month").fill("2026-12");
await p.getByText(/2026-12-09 · Robowaja/).waitFor();
const response = await p.request.get(
  "http://localhost:5173/research/malaysia-2026-11-08.txt",
);
if (!response.ok() || !(await response.text()).includes("140"))
  throw Error("Capture missing");
if (errors.length) throw Error(errors.join("\n"));
console.log(
  "PASS: 22 real report records, 17 dated releases, exact ISBN, report provenance, catalogue filtering, monthly brief and mobile layout",
);
await browser.close();
