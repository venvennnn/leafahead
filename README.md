# Leaf Ahead

An evidence-first Malaysian book intelligence desk. React, TypeScript, Vite and Three.js. All included titles are fictional, isolated development fixtures in `src/data.ts`; no market claims or inventory statuses are fabricated.

## Run

```sh
npm ci --cache /tmp/leaf-npm
npm run dev -- --port 5173
```

`npm run build` checks TypeScript and produces `dist/`. Routes: `/#/book-radar`, `/#/signal-room`, `/#/releases`, `/#/adaptations`, `/#/monthly-brief`, `/#/about`.

## Saved exports

Use **Load export** in the footer to import JSON. The adapter validates and normalizes records once. Imported data and the shortlist persist in this browser's localStorage. Never include credentials. Example:

```json
{
  "books": [
    {
      "id": "work-001",
      "title": "A real title",
      "author": "Author name",
      "color": "#325449",
      "motif": "tree",
      "edition": {
        "id": "edition-001",
        "publisher": "Publisher",
        "date": "2026-12-01",
        "isbn": "",
        "format": "Paperback"
      },
      "evidence": [
        {
          "id": "source-001",
          "kind": "catalogue",
          "label": "Publisher listing",
          "url": "https://example.com/book",
          "captured": "2026-11-10",
          "status": "lead",
          "scope": "Malaysia",
          "editionId": "edition-001"
        }
      ]
    }
  ]
}
```

Evidence kinds: `search`, `social`, `catalogue`, `media`; statuses: `lead`, `confirmed`. Omit `editionId` for work-level evidence. Source URLs must be HTTP(S). Export source failures as readable evidence only when a source actually exists; no zero-result or availability claims are inferred from missing records.

The repository originally contained no notebook, pipeline, exports or source schema. This is a new frontend adapter, not an integration with an existing pipeline. Daily observations, source failures, and film-first adaptation leads can be supplied through the optional fields below. Without them, their panels show explicit empty states. Monthly Brief filters saved captures and edition dates by month; it does not infer market-wide trends. No TMDB or API credentials are used. No data fetching or automatic discovery is performed by this frontend.

## Shelf and accessibility

Click a 3D volume, use the previous/next controls, or use the keyboard-accessible title buttons. Swipe horizontally to pan; vertical gestures retain normal page scrolling. Reset restores framing. Reduced motion settles selection immediately. An IntersectionObserver pauses offscreen rendering; pixel ratio is capped; scene resources are disposed when leaving Signal Room. `?fallback=1` explicitly tests the accessible HTML shelf, also used when WebGL creation fails.

## Validation

Desktop and mobile screenshots are in `artifacts/`. Browser validation covers synchronized title selection, shortlist persistence, filtering, no mobile overflow and fallback selection. Build validation: `npm run build`. Run `npm test` while the dev server is running on port 5173. Browser tests use `/usr/bin/chromium`; change `executablePath` for another installation. Additional checks cover 3D clicks, drag suppression, keyboard selection, imported evidence, comparable baseline calculations, failure states, film/book pairing and month filtering.

## Optional intelligence fields

Each book can include:

- `series`: arrays of `{kind, sourceLabel, sourceUrl, scope, metric, points: [{date: "YYYY-MM-DD", value: 12}]}`. Each series must use one source, geography and metric consistently. A chart and daily-average comparison require exactly covered latest 35 complete UTC dates, unique dates and finite nonnegative observations. Latest seven days are compared with the preceding 28 days. A zero baseline is reported without a percentage.
- `failures`: arrays of `{kind, sourceLabel, captured, reason: "unavailable" | "rate-limited", url}`. These appear explicitly and never count as zero observations.
- `adaptations`: arrays of `{film, openingDate?, linkEvidenceId, openingEvidenceId?}`. IDs reference the book's evidence records. Film leads show a real Three.js film/book pairing and separate link, Malaysian opening and edition sources. Supplied dates remain labeled by their source's lead/confirmed status; no automatic confirmation is performed.

A saved frontend export is the input, not a hard-coded discovery watchlist. Broad discovery and evidence review belong in the upstream collection pipeline, which was absent from this repository.
