import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Book } from "./data";
export type Series = {
  kind: string;
  sourceLabel: string;
  sourceUrl: string;
  scope: string;
  metric: string;
  points: { date: string; value: number }[];
};
export type Failure = {
  kind: string;
  sourceLabel: string;
  captured: string;
  reason: "unavailable" | "rate-limited";
  url: string;
};
export type Adaptation = {
  film: string;
  openingDate?: string;
  linkEvidenceId: string;
  openingEvidenceId?: string;
};
export function SignalChart({ book, kind }: { book: Book; kind: string }) {
  const s = book.series?.find((s) => s.kind === kind);
  const fail = book.failures?.filter((f) => f.kind === kind) || [];
  if (!s && !fail.length) return null;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dates = Array.from({ length: 35 }, (_, i) =>
    new Date(+today - (35 - i) * 86400000).toISOString().slice(0, 10),
  );
  const points = s
    ? dates.map((d) => s.points.find((p) => p.date === d)?.value)
    : [];
  const valid =
    points.length === 35 &&
    points.every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0);
  const values = points as number[];
  let comparison = "Collecting baseline";
  if (valid) {
    const latest = values.slice(28).reduce((a, b) => a + b, 0) / 7,
      baseline = values.slice(0, 28).reduce((a, b) => a + b, 0) / 28;
    comparison = baseline
      ? `${latest >= baseline ? "+" : ""}${Math.round((latest / baseline - 1) * 100)}% vs prior 28-day daily average`
      : "Baseline is zero — no percentage comparison";
  }
  return (
    <div className="signal-detail">
      {valid && (
        <svg
          viewBox="0 0 280 52"
          aria-label="35 complete days of comparable observations"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            points={values
              .map(
                (v, i) => `${i * 8},${48 - (v / Math.max(...values, 1)) * 42}`,
              )
              .join(" ")}
          />
        </svg>
      )}
      <p>{comparison}</p>
      {s && (
        <>
          <a href={s.sourceUrl} target="_blank" rel="noreferrer">
            {s.sourceLabel} ↗
          </a>
          <small>
            {s.scope} · {s.metric} ·{" "}
            {valid
              ? dates[0] + " to " + dates[34]
              : s.points.length
                ? [...s.points].sort((a, b) => a.date.localeCompare(b.date))[0]
                    .date +
                  " to " +
                  [...s.points].sort((a, b) => b.date.localeCompare(a.date))[0]
                    .date +
                  " · incomplete comparable coverage"
                : "No dated observations"}
          </small>
        </>
      )}
      {fail.map((f, i) => (
        <p key={i}>
          <a href={f.url} target="_blank" rel="noreferrer">
            {f.sourceLabel}
          </a>
          :{" "}
          {f.reason === "rate-limited" ? "Rate limited" : "Source unavailable"}{" "}
          · {f.captured}
        </p>
      ))}
    </div>
  );
}
function PairScene({ book, film }: { book: Book; film: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!el.current) return;
    let r: THREE.WebGLRenderer;
    try {
      r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    const host = el.current;
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    host.appendChild(r.domElement);
    const scene = new THREE.Scene(),
      cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    cam.position.set(0, 1.2, 9);
    cam.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 3));
    const resources: THREE.Texture[] = [];
    [film, book.title].forEach((title, i) => {
      const c = document.createElement("canvas");
      c.width = 320;
      c.height = 480;
      const x = c.getContext("2d")!;
      x.fillStyle = i ? book.color : "#202b3e";
      x.fillRect(0, 0, 320, 480);
      x.strokeStyle = "#ceb788";
      x.strokeRect(15, 15, 290, 450);
      x.fillStyle = "#f4dfb5";
      x.textAlign = "center";
      x.font = "13px Georgia";
      x.fillText(i ? "SOURCE BOOK" : "FILM LEAD", 160, 60);
      x.font = "27px Georgia";
      title.split(" ").forEach((w, n) => x.fillText(w, 160, 130 + n * 37));
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      resources.push(tex);
      const face = new THREE.MeshStandardMaterial({ map: tex });
      const side = new THREE.MeshStandardMaterial({
        color: i ? "#d8d1b7" : "#202b3e",
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.6, 0.27), [
        side,
        side,
        side,
        side,
        face,
        side,
      ]);
      mesh.position.x = i ? 1.1 : -1.1;
      mesh.rotation.y = i ? -0.25 : 0.25;
      scene.add(mesh);
    });
    const render = () => {
      r.setSize(host.clientWidth, 250);
      cam.aspect = host.clientWidth / 250;
      cam.updateProjectionMatrix();
      r.render(scene, cam);
    };
    const ro = new ResizeObserver(render);
    ro.observe(host);
    render();
    return () => {
      ro.disconnect();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            m.dispose(),
          );
        }
      });
      resources.forEach((t) => t.dispose());
      r.dispose();
      r.domElement.remove();
    };
  }, [book, film]);
  return (
    <div
      className="pair-scene"
      ref={el}
      aria-label={`${film} film paired with ${book.title}`}
    />
  );
}
export function Adaptations({ books }: { books: Book[] }) {
  const pairs = books.flatMap((b) =>
    (b.adaptations || []).map((a) => ({ b, a })),
  );
  if (!pairs.length)
    return (
      <div className="large-empty">
        <h2>No adaptation evidence loaded</h2>
        <p>
          Film-first leads need separate sources for the book connection,
          <br />
          Malaysian opening date, and edition. Search snippets alone are not
          confirmation.
        </p>
      </div>
    );
  return (
    <div className="brief-grid">
      {pairs.map(({ b, a }, i) => (
        <section key={i}>
          <PairScene book={b} film={a.film} />
          <h2>
            {a.film} → {b.title}
          </h2>
          <p>Malaysia opening: {a.openingDate || "Unconfirmed"}</p>
          {["Adaptation link", "Malaysian opening", "Edition"].map(
            (label, j) => {
              const e = b.evidence.find((e) =>
                j === 0
                  ? e.id === a.linkEvidenceId
                  : j === 1
                    ? e.id === a.openingEvidenceId
                    : e.editionId === b.edition.id,
              );
              return (
                <p key={label}>
                  {label}:{" "}
                  {e ? (
                    <a href={e.url} target="_blank" rel="noreferrer">
                      {e.label} · {e.status} · {e.captured} ↗
                    </a>
                  ) : (
                    "No confirmed evidence yet"
                  )}
                </p>
              );
            },
          )}
        </section>
      ))}
    </div>
  );
}
export function MonthlyBrief({ books }: { books: Book[] }) {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const releases = books.filter((b) => b.edition.date?.startsWith(period));
  const discovered = books.filter((b) =>
    b.evidence.some((e) => e.captured.startsWith(period)),
  );
  const pairs = books
    .flatMap((b) => (b.adaptations || []).map((a) => ({ b, a })))
    .filter(({ b, a }) =>
      b.evidence.some(
        (e) => e.id === a.linkEvidenceId && e.captured.startsWith(period),
      ),
    );
  return (
    <>
      <div className="brief-controls">
        <label>
          Reporting month{" "}
          <input
            aria-label="Reporting month"
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </label>
        <button className="primary" onClick={() => window.print()}>
          Print / save PDF ↗
        </button>
      </div>
      <div className="brief-grid">
        {[
          "Releases",
          "Discovery themes",
          "Adaptation leads",
          "Restock candidates",
        ].map((t, i) => (
          <section key={t}>
            <span className="tiny">{period} / MONTHLY INTELLIGENCE</span>
            <h2>{t}</h2>
            {i === 0 && releases.length ? (
              releases.map((b) => (
                <p key={b.id}>
                  {b.edition.date} · {b.title} · {b.edition.publisher}
                </p>
              ))
            ) : i === 1 && discovered.length ? (
              discovered.map((b) => (
                <p key={b.id}>
                  {b.title}:{" "}
                  {[
                    ...new Set(
                      b.evidence
                        .filter((e) => e.captured.startsWith(period))
                        .map((e) => e.kind),
                    ),
                  ].join(", ")}{" "}
                  sources
                </p>
              ))
            ) : i === 2 && pairs.length ? (
              pairs.map(({ a, b }, j) => (
                <p key={j}>
                  {a.film} → {b.title} · review adaptation evidence
                </p>
              ))
            ) : (
              <p>
                {i === 3
                  ? "No inventory data available. Check stock with the supplier before ordering."
                  : "No evidence available for this period."}
              </p>
            )}
          </section>
        ))}
      </div>
      <p>
        Coverage: saved source captures only. Discovery themes summarize source
        categories, not market-wide trends. No inventory or sales inference.
      </p>
    </>
  );
}
