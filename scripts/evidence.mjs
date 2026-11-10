import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto("http://localhost:5173");
await p.waitForTimeout(1200);
const canvas = p.locator("canvas");
const r = await canvas.boundingBox();
await p.mouse.click(r.x + r.width * 0.18, r.y + r.height * 0.5);
await p.waitForTimeout(500);
let name = await p.locator(".selection h2").textContent();
if (name === "Beneath the Rubber Trees") throw Error("3D click did not select");
const before = name;
await p.mouse.move(r.x + r.width * 0.4, r.y + r.height * 0.5);
await p.mouse.down();
await p.mouse.move(r.x + r.width * 0.7, r.y + r.height * 0.5, { steps: 8 });
await p.mouse.up();
if ((await p.locator(".selection h2").textContent()) !== before)
  throw Error("drag selected");
await p.getByRole("button", { name: "Reset shelf" }).click();
await p.getByRole("button", { name: "The River Returns", exact: true }).focus();
await p.keyboard.press("Enter");
if ((await p.locator(".selection h2").textContent()) !== "The River Returns")
  throw Error("keyboard selection");
const data = {
  books: [
    {
      id: "real",
      title: "Imported Test Work",
      author: "Test Author",
      color: "#335544",
      motif: "tree",
      edition: {
        id: "ed",
        publisher: "Test Publisher",
        date: "2026-12-01",
        isbn: "",
        format: "Paperback",
      },
      evidence: [
        {
          id: "e",
          kind: "catalogue",
          label: "Publisher source",
          url: "https://example.com/book",
          captured: "2026-11-10",
          status: "confirmed",
          scope: "Malaysia",
          editionId: "ed",
        },
      ],
    },
  ],
};
await p.locator("input[type=file]").setInputFiles({
  name: "test.json",
  mimeType: "application/json",
  buffer: Buffer.from(JSON.stringify(data)),
});
await p
  .getByRole("heading", { name: "Imported Test Work", exact: true })
  .waitFor();
if ((await p.locator(".evidence-link").count()) !== 2)
  throw Error("import evidence");
if (
  (await p.locator(".evidence-link").first().getAttribute("href")) !==
  "https://example.com/book"
)
  throw Error("source URL");
await p.getByRole("link", { name: "Releases", exact: true }).click();
await p.getByRole("cell", { name: "2026-12-01", exact: true }).waitFor();
for (const route of ["Adaptations", "Monthly Brief", "About", "Book Radar"]) {
  await p
    .getByRole("link", {
      name: route === "About" ? "ABOUT" : route,
      exact: true,
    })
    .click();
  await p.getByRole("heading", { name: route, exact: true }).waitFor();
}
console.log(
  "PASS: 3D click, drag suppression, keyboard, export import, evidence URLs, release table, all routes",
);
await browser.close();
