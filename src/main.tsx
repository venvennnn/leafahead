import React, { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  MessagesSquare,
  LibraryBig,
  Newspaper,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Leaf,
  ShieldCheck,
  CalendarDays,
  Info,
  Bookmark,
  Check,
  Upload,
} from "lucide-react";
import Shelf from "./Shelf";
import { demoBooks, parseExport, type Book } from "./data";
import "./style.css";
import { SignalChart, Adaptations, MonthlyBrief } from "./intelligence";
const pages = [
  "Book Radar",
  "Signal Room",
  "Releases",
  "Adaptations",
  "Monthly Brief",
  "About",
];
const slug = (s: string) => s.toLowerCase().replaceAll(" ", "-");
const kinds = ["search", "social", "catalogue", "media"];
const titles = [
  "Search interest",
  "Social discussion",
  "Catalogue presence",
  "Source coverage",
];
const subtitles = [
  "How people are looking for this book",
  "What readers are saying online",
  "Where the book appears in catalogues",
  "Mentions in readable media and book outlets",
];
const icons = [Search, MessagesSquare, LibraryBig, Newspaper];
function Botanical() {
  return (
    <svg
      className="botanical"
      viewBox="0 0 160 180"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M76 178C90 120 64 68 103 5M78 142C50 125 35 104 22 77M80 116C113 100 131 73 145 48M78 81C56 63 44 43 41 21" />
      {[
        [60, 123, -40],
        [40, 98, -35],
        [99, 105, 40],
        [121, 78, 45],
        [82, 64, -30],
        [97, 33, 25],
        [51, 47, -30],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M0 15C-27-1-21-27 0-44C22-24 23 0 0 15ZM0 15V-39M0-10L-12-23M0 0L13-16" />
        </g>
      ))}
    </svg>
  );
}
function Landscape() {
  return (
    <svg
      viewBox="0 0 380 100"
      className="landscape"
      fill="none"
      stroke="currentColor"
      strokeWidth=".9"
    >
      <path d="M0 88H380M3 83Q46 72 80 82T167 80T265 84T375 78M78 80V49L130 28L182 49V81M65 49L130 23L195 49ZM91 80V57H109V80M124 80V55H145V80M158 80V57H170V80M79 49H181M100 42L130 29L158 42M111 48V34M134 48V28M155 48V37" />
      {[20, 43, 230, 273, 335].map((x, i) => (
        <g key={x} transform={`translate(${x} ${i % 2 ? 8 : 0})`}>
          <path d="M0 80Q8 49 3 23M3 23Q-24 7-16 33M3 23Q-9 0 6 3M3 23Q29 6 30 28M3 23Q29 24 21 45M3 23Q-16 24-23 43" />
        </g>
      ))}
    </svg>
  );
}
function App() {
  const [page, setPage] = useState(
    pages.find((p) => location.hash === "#/" + slug(p)) || "Signal Room",
  );
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      return parseExport(
        JSON.parse(localStorage.getItem("leaf-export") || "null"),
      );
    } catch {
      return demoBooks;
    }
  });
  const [demo, setDemo] = useState(!localStorage.getItem("leaf-export"));
  const [selected, setSelected] = useState(
    books[Math.min(7, books.length - 1)].id,
  );
  const [reset, setReset] = useState(0);
  const [filter, setFilter] = useState("all");
  const [evidenceFilter, setEvidenceFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("leaf-shortlist") || "[]");
    } catch {
      return [];
    }
  });
  const select = useCallback((id: string) => setSelected(id), []);
  const book = books.find((b) => b.id === selected) || books[0];
  const navigate = (p: string) => {
    setPage(p);
    location.hash = "/" + slug(p);
  };
  React.useEffect(() => {
    const fn = () =>
      setPage(
        pages.find((p) => location.hash === "#/" + slug(p)) || "Signal Room",
      );
    addEventListener("hashchange", fn);
    return () => removeEventListener("hashchange", fn);
  }, []);
  const toggle = (id: string) => {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    setSaved(next);
    localStorage.setItem("leaf-shortlist", JSON.stringify(next));
  };
  const step = (d: number) =>
    select(
      books[
        (books.findIndex((b) => b.id === selected) + d + books.length) %
          books.length
      ].id,
    );
  const jump = () =>
    document.getElementById("evidence")?.scrollIntoView({ behavior: "smooth" });
  const load = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const f = e.target.files?.[0];
      if (!f) return;
      const raw = await f.text(),
        next = parseExport(JSON.parse(raw));
      localStorage.setItem("leaf-export", raw);
      setBooks(next);
      select(next[0].id);
      setDemo(false);
      setNotice("Export loaded successfully.");
    } catch (e) {
      setNotice((e as Error).message);
    }
  };
  const visible = books.filter(
    (b) =>
      b.title.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" ||
        (filter === "saved"
          ? saved.includes(b.id)
          : b.evidence.some((e) => e.kind === filter))),
  );
  return (
    <>
      <header>
        <a className="wordmark" href="#/signal-room">
          LEAF AHEAD
        </a>
        <span className="tagline">MALAYSIAN BOOKSTORE INTELLIGENCE</span>
        <nav aria-label="Main navigation">
          {pages.slice(0, 5).map((p) => (
            <a
              key={p}
              className={page === p ? "active" : ""}
              href={"#/" + slug(p)}
            >
              {p}
            </a>
          ))}
        </nav>
        <a className="about" href="#/about">
          ABOUT
        </a>
      </header>
      {page === "Signal Room" ? (
        <>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">THE</div>
              <h1>SIGNAL ROOM</h1>
              <p>
                EVIDENCE-FIRST BOOK INTELLIGENCE
                <br />
                FOR MALAYSIA
              </p>
              <Landscape />
            </div>
            <div className="shelf-wrap">
              <Shelf
                books={books}
                selected={selected}
                onSelect={select}
                reset={reset}
              />
              <div className="shelf-controls">
                <span>
                  THE READING SHELF{" "}
                  <i>
                    /{" "}
                    {String(
                      books.findIndex((b) => b.id === selected) + 1,
                    ).padStart(2, "0")}{" "}
                    OF {books.length}
                  </i>
                </span>
                <div>
                  <button onClick={() => step(-1)} aria-label="Previous book">
                    <ArrowLeft size={15} />
                  </button>
                  <button onClick={() => step(1)} aria-label="Next book">
                    <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={() => setReset((x) => x + 1)}
                    aria-label="Reset shelf"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </div>
            <aside className="hero-leaves">
              <Botanical />
            </aside>
          </section>
          <div className="scope-strip">
            <div className="scope">
              <b>SCOPE</b>
              <span>🇲🇾 &nbsp; Malaysia ⌄</span>
            </div>
            <p>
              <Leaf size={18} /> Evidence from public, readable sources across
              search, social, catalogues and media.
            </p>
            <div className="source-nav">
              <b>SOURCES</b>
              {["Search", "Social", "Catalogues", "Media"].map((s, i) => (
                <button
                  key={s}
                  onClick={() => {
                    setEvidenceFilter(kinds[i]);
                    jump();
                  }}
                >
                  {s} <ArrowUpRight size={12} />
                </button>
              ))}
            </div>
          </div>
          <div className="selection">
            <div>
              <span className="tiny">ON THE DESK</span>
              <h2>{book.title}</h2>
              <span className="book-meta">
                {book.author} · {book.edition.format} · {book.edition.publisher}
              </span>
            </div>
            <div className="selection-actions">
              <button onClick={() => toggle(book.id)}>
                {saved.includes(book.id) ? (
                  <Check size={15} />
                ) : (
                  <Bookmark size={15} />
                )}{" "}
                {saved.includes(book.id) ? "Shortlisted" : "Shortlist"}
              </button>
              <button
                onClick={() =>
                  setNotice(
                    `${book.title}: check current stock directly with the publisher or catalogue supplier. Leaf Ahead has no inventory data.`,
                  )
                }
              >
                Check stock
              </button>
              <button
                className="primary"
                onClick={() => {
                  setEvidenceFilter("all");
                  jump();
                }}
              >
                Open evidence <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
          <div className="insights">
            {titles.map((t, i) => {
              const Icon = icons[i],
                count = book.evidence.filter((e) => e.kind === kinds[i]).length;
              return (
                <section className="insight" key={t}>
                  <div className="panel-heading">
                    <span className="icon-box">
                      <Icon size={25} strokeWidth={1.2} />
                    </span>
                    <div>
                      <h3>{t}</h3>
                      <p>{subtitles[i]}</p>
                    </div>
                  </div>
                  <div className="illustration">
                    {i === 0 ? (
                      <svg
                        viewBox="0 0 280 80"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth=".8"
                      >
                        {[0, 5, 10, 15, 20].map((y) => (
                          <path
                            key={y}
                            d={`M10 72L58 ${44 + y / 4}L78 ${51 + y / 4}L126 ${10 + y}L154 ${36 + y / 2}L175 ${24 + y}L230 ${58 + y / 4}L270 72M80 65L126 ${10 + y}L116 ${45 + y / 2}L145 65`}
                          />
                        ))}
                      </svg>
                    ) : i === 1 ? (
                      <Botanical />
                    ) : (
                      <Icon size={78} strokeWidth={0.65} />
                    )}
                  </div>
                  <div className="empty-title">
                    {count
                      ? `${count} readable sources`
                      : book.series?.some((s) => s.kind === kinds[i])
                        ? "Source observations"
                        : "Awaiting comparable data"}
                  </div>
                  <div className="ornament">
                    <span />
                    <Leaf size={17} />
                    <span />
                  </div>
                  {!book.series?.some((s) => s.kind === kinds[i]) && (
                    <small>Collecting baseline</small>
                  )}
                  <SignalChart book={book} kind={kinds[i]} />
                </section>
              );
            })}
          </div>
          <div className="evidence-filters" aria-label="Evidence source filter">
            {["all", ...kinds].map((k) => (
              <button
                key={k}
                aria-pressed={evidenceFilter === k}
                onClick={() => setEvidenceFilter(k)}
              >
                {k === "all" ? "All evidence" : k}
              </button>
            ))}
          </div>
          <section id="evidence" className="evidence-grid">
            {["lead", "confirmed", "feed"].map((status, i) => {
              const Icon = [Leaf, ShieldCheck, CalendarDays][i];
              const items = book.evidence
                .filter(
                  (e) =>
                    (status === "feed" || e.status === status) &&
                    (evidenceFilter === "all" || e.kind === evidenceFilter),
                )
                .sort((a, b) => b.captured.localeCompare(a.captured));
              return (
                <section className="evidence-panel" key={status}>
                  <div className="section-title">
                    <Icon size={23} />
                    <h3>
                      {
                        [
                          "RETRIEVED LEADS",
                          "CONFIRMED EVIDENCE",
                          "RECENT FEED",
                        ][i]
                      }
                    </h3>
                    <Info size={14} />
                  </div>
                  {i < 2 && (
                    <p className="description">
                      {i === 0
                        ? "Relevant, readable mentions found from sources in scope. To be reviewed for confirmation."
                        : "Verified, in-scope evidence with a clear and readable source (e.g. official listing, publisher note, or media coverage)."}
                    </p>
                  )}
                  {items.length ? (
                    items.map((e) => (
                      <a
                        className="evidence-link"
                        href={e.url}
                        key={e.id}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>
                          {e.label}
                          <small>
                            {e.captured} · {e.scope} ·{" "}
                            {e.editionId ? "Edition" : "Work"} evidence
                          </small>
                        </span>
                        <ArrowUpRight size={15} />
                      </a>
                    ))
                  ) : i === 0 ? (
                    <div className="lead-empty">
                      <Search size={27} strokeWidth={1} />
                      <p>No retrieved leads for this title yet.</p>
                      <small>Import a saved export to begin the review.</small>
                    </div>
                  ) : i === 1 ? (
                    <div className="confirmed-empty">
                      <Botanical />
                      <div>
                        No confirmed evidence yet
                        <div className="ornament">
                          <span />
                          <Leaf size={16} />
                          <span />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="feed-empty">
                      <span className="timeline-dot" />
                      <div>
                        Your evidence trail starts here.
                        <small>
                          Captured sources and review activity for
                          <br />
                          <i>{book.title}</i> will appear here.
                        </small>
                        <p>
                          Coverage: no comparable observation period available.
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </section>
          <div className="title-list">
            <span className="tiny">BROWSE THE SHELF</span>
            {books.map((b) => (
              <button
                key={b.id}
                aria-pressed={selected === b.id}
                onClick={() => select(b.id)}
              >
                {b.title}
              </button>
            ))}
          </div>
        </>
      ) : (
        <main className="other-page">
          <span className="tiny">LEAF AHEAD / {page.toUpperCase()}</span>
          <h1>{page}</h1>
          <p className="intro">
            {
              {
                "Book Radar":
                  "A considered view of what deserves a closer look.",
                Releases:
                  "The publishing calendar, with the source kept in sight.",
                Adaptations: "From the screen to the reading shelf.",
                "Monthly Brief": "A quiet moment to take stock.",
                About: "Better buying decisions begin with readable evidence.",
              }[page]
            }
          </p>
          {page === "Book Radar" ? (
            <>
              <div className="filter-bar">
                <label>
                  <Search size={17} />
                  <input
                    aria-label="Search titles"
                    placeholder="Find a title…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Signal filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All titles</option>
                  <option value="saved">My shortlist ({saved.length})</option>
                  {kinds.map((k, i) => (
                    <option key={k} value={k}>
                      {titles[i]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="radar-grid">
                {visible.map((b) => (
                  <article key={b.id}>
                    <div className="book-cover" style={{ background: b.color }}>
                      <small>LEAF AHEAD</small>
                      <h2>{b.title}</h2>
                      <Botanical />
                      <span>{b.author}</span>
                    </div>
                    <div>
                      <span className="tiny">
                        {demo
                          ? "ILLUSTRATIVE TITLE"
                          : `${b.evidence.length} SOURCES`}
                      </span>
                      <h2>{b.title}</h2>
                      <p>
                        {b.evidence.length
                          ? "Review sources before a buying decision."
                          : "No discovery evidence loaded."}
                      </p>
                      <button
                        onClick={() => {
                          select(b.id);
                          navigate("Signal Room");
                        }}
                      >
                        Inspect signals ↗
                      </button>
                      <button
                        aria-label={"Shortlist " + b.title}
                        onClick={() => toggle(b.id)}
                      >
                        {saved.includes(b.id) ? (
                          <Check size={18} />
                        ) : (
                          <Bookmark size={18} />
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!visible.length && <p>No titles match this filter.</p>}
            </>
          ) : page === "Releases" ? (
            <>
              <table>
                <thead>
                  <tr>
                    {[
                      "Scheduled date",
                      "Title / edition",
                      "Publisher",
                      "ISBN",
                      "Original source",
                    ].map((s) => (
                      <th key={s}>{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {books
                    .filter((b) => b.edition.date)
                    .sort((a, b) =>
                      a.edition.date.localeCompare(b.edition.date),
                    )
                    .map((b) => (
                      <tr key={b.id}>
                        <td>{b.edition.date}</td>
                        <td>
                          <button
                            onClick={() => {
                              select(b.id);
                              navigate("Signal Room");
                            }}
                          >
                            {b.title}
                          </button>
                          <small>{b.edition.format}</small>
                        </td>
                        <td>{b.edition.publisher}</td>
                        <td>{b.edition.isbn || "Not supplied"}</td>
                        <td>
                          {b.evidence
                            .filter((e) => e.kind === "catalogue")
                            .map((e) => (
                              <a
                                key={e.id}
                                href={e.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {e.label} ↗
                              </a>
                            ))}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {books.some((b) => b.edition.date) && (
                <div className="release-shelf">
                  <Shelf
                    books={books.filter((b) => b.edition.date)}
                    selected={selected}
                    onSelect={select}
                    reset={reset}
                  />
                  <button
                    className="primary"
                    onClick={() => navigate("Signal Room")}
                  >
                    Inspect selected title ↗
                  </button>
                </div>
              )}
              {!books.some((b) => b.edition.date) && (
                <div className="large-empty">
                  <CalendarDays size={42} />
                  <h2>No verified release dates loaded</h2>
                  <p>
                    Load edition records with scheduled dates to populate the
                    calendar.
                  </p>
                </div>
              )}
            </>
          ) : page === "Adaptations" ? (
            <Adaptations books={books} />
          ) : page === "Monthly Brief" ? (
            <MonthlyBrief books={books} />
          ) : (
            <div className="about-grid">
              <section>
                <h2>A signal is a starting point.</h2>
                <p>
                  Search interest, reader discussion, catalogue listings, and
                  media coverage are distinct signals. None is a substitute for
                  sales or stock data.
                </p>
                <h2>From lead to evidence.</h2>
                <p>
                  Retrieved leads await review. Confirmed evidence must link to
                  a readable source, retain capture dates and geographic scope,
                  and distinguish a work from its edition.
                </p>
              </section>
              <section>
                <h2>Know the limits.</h2>
                <p>
                  Trends require the latest seven complete days and the previous
                  28 comparable days. Until then, we are collecting a baseline.
                  Missing data never means zero interest.
                </p>
                <h2>Bring your own evidence.</h2>
                <p>
                  Load a saved JSON export below. Data stays in this browser. No
                  API keys are needed. Included book designs are fictional
                  development fixtures.
                </p>
              </section>
            </div>
          )}
        </main>
      )}
      <footer>
        <div>
          <Leaf size={18} />
          <span>LEAF AHEAD</span>
          <p>A little ahead. Always grounded.</p>
        </div>
        <div className="data-tools">
          <span>
            {demo
              ? "DEMONSTRATION SHELF · NO LIVE EVIDENCE"
              : "SAVED EXPORT · LOCAL TO THIS BROWSER"}
          </span>
          <label className="import-button">
            <Upload size={14} /> Load export
            <input
              type="file"
              accept=".json,application/json"
              onChange={load}
            />
          </label>
        </div>
      </footer>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
