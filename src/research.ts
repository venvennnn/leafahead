import type { Book } from "./data";
export const capture = "2026-11-08T16:02:26.433027+08:00";
const colours = [
  "#793329",
  "#343a32",
  "#185576",
  "#c8b79a",
  "#304b37",
  "#49362c",
  "#316467",
  "#d4bb88",
  "#bdac91",
  "#184d75",
];
const observed = [
  [
    "Greta and the Giants : inspired by Greta Thunberg’s stand to save the world (Illustrated)",
    "9780711253759",
    "Kinokuniya Malaysia",
  ],
  ["NAMA SAYA HASMAH", "9789678608299", "Kinokuniya Malaysia"],
  ["It Ends With Us (UK)", "9781471156267", "MPH"],
  [
    "Hamka: Tenggelamnya Kapal Van Der Wijck (Edisi 2026)",
    "9786294932364",
    "MPH",
  ],
  [
    "Pokécology an Illustrated Guide to Pokémon Ecology (Pokemon Pikachu Press)",
    "9781604382655",
    "Kinokuniya Malaysia",
  ],
];
const releases = [
  [
    "Robowaja #1: Kuasa Saga Merah - Edisi Kemas Kini",
    "9786297858654",
    "2026-12-09",
  ],
  ["Captain Shooter: Pelindung Negara", "9786294642218", "2026-11-30"],
  ["Kita Pendakwah bukan Penghukum", "", "2026-11-20"],
  ["Krisis Idea dan Pemikiran dalam Dunia Islam", "", "2026-11-20"],
  ["Solat yang Mengubah Diri dan Negara", "", "2026-11-20"],
  [
    "Turath - Genius Imam Syafie: Permata Umat Sepanjang Zaman (2026)",
    "9786294932685",
    "2026-11-20",
  ],
  ["The Finacial Well Being Book", "9786294641662", "2026-11-20"],
  ["The Smart Marketing Book", "9786294641648", "2026-11-20"],
  ["The Influence Book", "9786294641686", "2026-11-20"],
  ["The Smart Advertising Book", "9786294641679", "2026-11-20"],
  ["The Entrepreneur’s Book", "9786294641655", "2026-11-20"],
  [
    "Turath - Melangkah selepas Patah: Seni Berdamai dengan Kehilangan (2026)",
    "9786294930810",
    "2026-11-18",
  ],
  ["CUN #12: GAZA", "9786297858647", "2026-11-17"],
  ["Diari Conteng Jimi #6: Sekolah Genius", "9786297858432", "2026-11-17"],
  ["Belajar Menjadi Manusia", "9786294642171", "2026-11-13"],
  ["How to Raise Entrepreneurial Kids", "9786294932692", "2026-11-13"],
  [
    "Turath - Kusangkakan Pahala Rupanya Dosa (2026)",
    "9786294931824",
    "2026-11-10",
  ],
];
export const researchBooks: Book[] = [
  ...observed.map(([title, isbn, origin]) => ({
    title,
    isbn,
    origin,
    date: "",
  })),
  ...releases.map(([title, isbn, date]) => ({
    title,
    isbn,
    date,
    origin: "PTS",
  })),
].map((row, i) => ({
  id: row.isbn || "pts-reported-" + i,
  title: row.title,
  author: "Author not supplied",
  color: colours[i % colours.length],
  motif: ["tree", "flower", "moon", "boat", "house"][i % 5],
  edition: {
    id: "reported-" + (row.isbn || i),
    publisher: row.origin === "PTS" ? "PTS" : "Publisher not supplied",
    date: row.date,
    isbn: row.isbn,
    format: "Format not supplied",
  },
  evidence: [],
  research: {
    origin: row.origin,
    captured: capture,
    scope: "Malaysia",
    note: row.date
      ? "Publisher date reported as “Tarikh Terbit” in the supplied capture. Original URL omitted; reconfirm before promotion."
      : "Retailer catalogue entry reported in the supplied capture. Original URL omitted; current availability is unverified.",
  },
}));
