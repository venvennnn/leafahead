import type { Book } from "./data";
const period = "5 Oct – 8 Nov 2026";
function seedFor(id: string) {
  return [...id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
}
export function sampleSignal(book: Book, index: number) {
  const seed = seedFor(book.id) + index * 47;
  const values = Array.from({ length: 35 }, (_, i) =>
    Math.round(
      15 +
        (seed % 27) +
        Math.sin(i * 0.65 + seed) * 6 +
        i * (0.15 + (seed % 9) / 15),
    ),
  );
  const recent = values.slice(28).reduce((a, b) => a + b) / 7,
    prior = values.slice(0, 28).reduce((a, b) => a + b) / 28;
  const total = [
    Math.round(recent),
    24 + (seed % 170),
    2 + (seed % 5),
    3 + (seed % 11),
  ][index];
  return { values, total, change: Math.round((recent / prior - 1) * 100) };
}
export function SimulatedSignal({
  book,
  index,
}: {
  book: Book;
  index: number;
}) {
  const { values, total, change } = sampleSignal(book, index);
  const names = [
    "sample search index",
    "sample reader mentions",
    "sample catalogue matches",
    "sample media mentions",
  ];
  return (
    <div className="sample-signal">
      <span className="sample-badge">SIMULATED</span>
      <div className="sample-stat">
        {total}
        {index === 0 && <small>/100</small>}
      </div>
      <p>{names[index]}</p>
      <svg
        viewBox="0 0 280 65"
        role="img"
        aria-label={`Simulated ${names[index]} for ${book.title}`}
      >
        <path
          d={`M0 62 ${values.map((v, i) => `L${(i * 280) / 34} ${58 - (v / Math.max(...values)) * 49}`).join(" ")} L280 65 L0 65Z`}
          fill="#172ca510"
        />
        <polyline
          points={values
            .map(
              (v, i) =>
                `${(i * 280) / 34},${58 - (v / Math.max(...values)) * 49}`,
            )
            .join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
      <strong>
        {change >= 0 ? "+" : ""}
        {change}% <span>sample change vs prior 28 days</span>
      </strong>
      <small>{period} · Fictional observations</small>
    </div>
  );
}
export function SimulatedEvidence({
  book,
  panel,
  filter,
}: {
  book: Book;
  panel: number;
  filter: string;
}) {
  const seed = seedFor(book.id);
  const entries = [
    {
      kind: "social",
      title: "Reader conversation",
      text: `A fictional reading-group thread discusses “${book.title}” and asks about a future book-club selection.`,
      date: "8 Nov 2026",
    },
    {
      kind: "catalogue",
      title: "Edition match to review",
      text: `A sample catalogue candidate for “${book.title}” is waiting for an ISBN and supplier check.`,
      date: "7 Nov 2026",
    },
    {
      kind: "media",
      title: "Editorial feature candidate",
      text: `An invented reading-roundup entry mentions “${book.title}”. This is a sample, not a published article.`,
      date: "6 Nov 2026",
    },
    {
      kind: "search",
      title: "Search activity snapshot",
      text: `Illustrative index: ${sampleSignal(book, 0).total}/100. Generated for the demo, not collected from a search service.`,
      date: "5 Nov 2026",
    },
  ].filter((e) => filter === "all" || e.kind === filter);
  if (panel === 1)
    return (
      <div className="sample-review">
        <span className="sample-badge">SIMULATED WORKFLOW</span>
        <h4>{2 + (seed % 4)} sample items ready for review</h4>
        <p>
          Example checks: title match, edition match, source readability and
          Malaysia scope.
        </p>
        <small>No sample item is genuine confirmed evidence.</small>
      </div>
    );
  return (
    <div className="sample-entries">
      {entries.length ? (
        entries.slice(0, panel === 0 ? 3 : 4).map((e) => (
          <article key={e.kind}>
            <span className="tiny">
              {panel === 2 ? e.date : e.kind.toUpperCase()} · SIMULATED
            </span>
            <h4>{e.title}</h4>
            <p>{e.text}</p>
          </article>
        ))
      ) : (
        <p>No sample entries for this filter.</p>
      )}
      <small>Fictional examples · No original source links</small>
    </div>
  );
}
