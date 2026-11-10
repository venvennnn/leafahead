import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const p = await browser.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://localhost:5173");
const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const book = {
  id: "test",
  title: "Fixture Work",
  author: "Fixture Author",
  color: "#325449",
  motif: "tree",
  edition: {
    id: "ed",
    publisher: "Fixture Publisher",
    date: "2026-12-01",
    format: "Paperback",
    isbn: "",
  },
  evidence: [
    {
      id: "link",
      kind: "media",
      label: "Fixture announcement",
      url: "https://example.com/film",
      captured: "2026-11-10",
      status: "lead",
      scope: "Malaysia",
    },
  ],
  series: [
    {
      kind: "search",
      sourceLabel: "Fixture observations",
      sourceUrl: "https://example.com/search",
      scope: "Malaysia",
      metric: "index",
      points: Array.from({ length: 35 }, (_, i) => ({
        date: new Date(+today - (35 - i) * 86400000).toISOString().slice(0, 10),
        value: i < 28 ? 10 : 20,
      })),
    },
  ],
  failures: [
    {
      kind: "social",
      sourceLabel: "Fixture discussion",
      url: "https://example.com/social",
      captured: "2026-11-10",
      reason: "rate-limited",
    },
  ],
  adaptations: [{ film: "Fixture Film", linkEvidenceId: "link" }],
};
async function load(b) {
  await p
    .locator("input[type=file]")
    .setInputFiles({
      name: "fixture.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ books: [b] })),
    });
}
await load(book);
await p
  .getByText("+100% vs prior 28-day daily average", { exact: true })
  .waitFor();
await p.getByText(/Rate limited/).waitFor();
await p.getByRole("link", { name: "Adaptations", exact: true }).click();
await p.locator(".pair-scene canvas").waitFor();
await p.getByText("Fixture Film → Fixture Work", { exact: true }).waitFor();
await p.getByRole("link", { name: "Monthly Brief", exact: true }).click();
await p.getByLabel("Reporting month").fill("2026-12");
await p.getByText(/2026-12-01 · Fixture Work/).waitFor();
await p.getByRole("link", { name: "Signal Room", exact: true }).click();
book.series[0].points.pop();
await load(book);
await p.getByText("Collecting baseline", { exact: true }).first().waitFor();
if (
  await p
    .getByText("+100% vs prior 28-day daily average", { exact: true })
    .count()
)
  throw Error("Incomplete baseline compared");
await p.setViewportSize({ width: 390, height: 844 });
const before = await p.locator(".selection h2").textContent();
const c = await p.locator("canvas").boundingBox();
await p
  .locator("canvas")
  .dispatchEvent("pointerdown", {
    clientX: c.x + 60,
    clientY: c.y + 80,
    pointerId: 1,
    pointerType: "touch",
  });
await p
  .locator("canvas")
  .dispatchEvent("pointerup", {
    clientX: c.x + 200,
    clientY: c.y + 80,
    pointerId: 1,
    pointerType: "touch",
  });
if ((await p.locator(".selection h2").textContent()) !== before)
  throw Error("Swipe selected a title");
if (errors.length) throw Error(errors.join("\n"));
console.log(
  "PASS: comparable trend, incomplete baseline, source failure, adaptation 3D pairing, period brief, touch drag suppression",
);
await browser.close();
