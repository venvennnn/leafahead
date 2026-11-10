import type { Series, Failure, Adaptation } from "./intelligence";
export type Evidence = {
  id: string;
  kind: "search" | "social" | "catalogue" | "media";
  label: string;
  url: string;
  captured: string;
  status: "lead" | "confirmed";
  scope: string;
  editionId?: string;
};
export type Book = {
  research?: { origin: string; captured: string; scope: string; note: string };
  id: string;
  title: string;
  author: string;
  color: string;
  motif: string;
  edition: {
    id: string;
    publisher: string;
    date: string;
    isbn: string;
    format: string;
  };
  evidence: Evidence[];
  series?: Series[];
  failures?: Failure[];
  adaptations?: Adaptation[];
};
export const demoBooks: Book[] = [
  ["red-hill", "The Red Hill", "Tan Mei Lin", "#793329", "flower"],
  ["mist", "Mist over Gunung Tahan", "Amir Iskandar", "#343a32", "mountain"],
  ["echoes", "Echoes of Malacca", "Sarah Lim", "#185576", "boat"],
  ["river", "The River Returns", "Nadia Rahman", "#c8b79a", "tree"],
  ["small-town", "A Small Town Summer", "Lee Jia Wen", "#304b37", "house"],
  ["burning", "A Burning Season", "Farid Hassan", "#49362c", "tree"],
  ["mangrove", "The Mangrove Letters", "Aisha Yusof", "#316467", "tree"],
  ["rubber", "Beneath the Rubber Trees", "S. Devika", "#d4bb88", "house"],
  ["ipoh", "Songs from Ipoh", "Chong Wei Ling", "#bdac91", "flower"],
  ["tides", "Tides at Dusk", "Hana Abdullah", "#184d75", "moon"],
].map(([id, title, author, color, motif]) => ({
  id,
  title,
  author,
  color,
  motif,
  edition: {
    id: id + "-demo",
    publisher: "Illustrative edition",
    date: "",
    isbn: "",
    format: "Hardback",
  },
  evidence: [],
}));
export function parseExport(value: unknown): Book[] {
  if (
    !value ||
    typeof value !== "object" ||
    !("books" in value) ||
    !Array.isArray(value.books) ||
    !value.books.length
  )
    throw new Error(
      "Expected a non-empty books array. See README for the export format.",
    );
  const ids = new Set<string>();
  return value.books.map((b: unknown) => {
    if (!b || typeof b !== "object") throw new Error("Invalid book");
    const x = b as Book;
    if (
      typeof x.id !== "string" ||
      !x.id ||
      ids.has(x.id) ||
      typeof x.title !== "string" ||
      typeof x.author !== "string" ||
      !x.edition ||
      typeof x.edition.id !== "string" ||
      !Array.isArray(x.evidence)
    )
      throw new Error(
        "Every book needs a unique id, title, author, edition and evidence array.",
      );
    ids.add(x.id);
    if (
      x.series &&
      (!Array.isArray(x.series) ||
        x.series.some(
          (s) =>
            !["search", "social", "catalogue", "media"].includes(s.kind) ||
            !s.sourceLabel ||
            !/^https?:\/\//.test(s.sourceUrl) ||
            !s.scope ||
            !s.metric ||
            !Array.isArray(s.points) ||
            new Set(s.points.map((p) => p.date)).size !== s.points.length ||
            s.points.some(
              (p) =>
                !/^\d{4}-\d{2}-\d{2}$/.test(p.date) ||
                !Number.isFinite(p.value) ||
                p.value < 0,
            ),
        ))
    )
      throw new Error("Invalid daily observation series.");
    if (
      x.failures &&
      (!Array.isArray(x.failures) ||
        x.failures.some(
          (f) =>
            !["unavailable", "rate-limited"].includes(f.reason) ||
            !["search", "social", "catalogue", "media"].includes(f.kind) ||
            !f.sourceLabel ||
            !Number.isFinite(Date.parse(f.captured)) ||
            !/^https?:\/\//.test(f.url),
        ))
    )
      throw new Error("Invalid source failure.");
    if (
      x.adaptations &&
      (!Array.isArray(x.adaptations) ||
        x.adaptations.some(
          (a) => !a.film || !x.evidence.some((e) => e.id === a.linkEvidenceId),
        ))
    )
      throw new Error("Adaptations require a film and matching link evidence.");
    return {
      ...x,
      color: /^#[0-9a-f]{6}$/i.test(x.color) ? x.color : "#325449",
      motif: x.motif || "tree",
      edition: { ...x.edition },
      evidence: x.evidence.map((e) => {
        if (
          !["search", "social", "catalogue", "media"].includes(e.kind) ||
          !["lead", "confirmed"].includes(e.status) ||
          !e.label ||
          !e.scope ||
          !Number.isFinite(Date.parse(e.captured)) ||
          !/^https?:\/\//.test(e.url)
        )
          throw new Error(
            "Evidence requires kind, status, label, scope, capture date and an HTTP(S) source URL.",
          );
        return e;
      }),
    };
  });
}
