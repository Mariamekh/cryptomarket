# Crypto Market Sensemaking UI

A small, focused frontend tool for quickly understanding and exploring the current
crypto market. It puts the market's movement first (top gainers/losers), then a
fast, scannable table of the top 100 assets with inline 7-day trends and an
expandable detail view.

Built for a timed technical task. The priority was **judgment, architecture, data
handling, and performance** over visual polish.

---

## How to run

Requirements: Node 18+ (built and tested on Node 24).

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check (tsc) + production build
npm run test       # Vitest unit tests (formatters + market logic)
npm run preview    # serve the production build
```

### Live vs. demo data

The app uses the **live CoinGecko API** by default. CoinGecko's free tier
rate-limits and can occasionally be unreachable, so there is a fully shaped
**mock dataset** as a fallback. You can switch sources three ways:

- the **Live / Demo** toggle in the header,
- the error screen's **"Use demo data"** button (shown automatically on a failed fetch),
- an env flag copy `.env.example` to `.env.local` and set `VITE_USE_MOCK=true` to force mock.

---

## What I built

- **Top Movers strip** — the first thing on screen: top 5 gainers and top 5 losers
  by 24h change. Answers "what's the market doing right now?" before you read a single row.
  Clicking a mover filters the table to it and expands its detail.
- **Market table** — rank, coin (icon + name + symbol), price, **1h / 24h / 7d**
  color-coded % change, market cap, and an inline **7-day sparkline** per row.
- **Row detail** — click any row to expand an inline panel with a larger 7-day chart
  and key stats (market cap, 24h volume, 24h high/low, circulating supply, ATH).
- **Interactions** — debounced search by name/symbol, click-to-sort on every numeric
  column, click-to-expand rows.
- **States** — skeleton loading, a clear error screen with **Retry** + demo fallback,
  and live freshness signals: a **LIVE/DEMO** badge, a ticking "Updated Xs ago", a
  refreshing spinner, a manual **Refresh** button, and **auto-refresh every 60s**.
  Refreshes never blank the table (previous data is kept while new data loads), and price
  cells flash green/red when a value changes.

---

## API / data source

[CoinGecko `/coins/markets`](https://api.coingecko.com/api/v3/coins/markets) (free, keyless):

```
?vs_currency=usd&order=market_cap_desc&per_page=100&page=1
&sparkline=true&price_change_percentage=1h,24h,7d
```

A single request powers the whole screen (the percentage windows and the 7-day
sparkline are requested up front). The mock dataset in `src/services/mockData.ts` is
shaped **identically** to this response, generated from a seeded base that drifts slightly
on each refresh so demo data behaves like a live market.

---

## Project structure

```
src/
  components/        Reusable UI pieces
    PercentChange    color-coded % (green/red/neutral)
    Sparkline        inline-SVG 7-day trend line
    CoinIcon         logo with symbol-monogram fallback
    MarketRow        memoized table row (+ field-level comparator)
    RowDetail        expanded inline detail panel
    TableHeader      sortable column header
    columns.ts       single shared column definition
    MarketTable      virtualized table (react-virtual)
    TopMovers        gainers/losers strip
    SearchBar        debounced search input
    Header           title + live data-status bar
    LastUpdated      isolated "Updated Xs ago" ticker
    LoadingSkeleton  first-load placeholder
    ErrorState       error screen (retry + demo fallback)
  hooks/             Generic UI hooks
    useDebounce      generic value debounce
    useRefreshStatus minimum-visible refresh feedback state
  services/          Data-access layer (talks to the network)
    api.ts           CoinGecko client + mock toggle
    mockData.ts      deterministic CoinGecko-shaped mock
    useMarketData    TanStack Query wrapper: fetch, cache, 60s refetch, stale, retry
  lib/               Pure helpers (no React)
    market.ts        pure logic: filter / sort / top movers / sort-toggle
    format.ts        price / market-cap / % / relative-time formatters
    sparkline.ts     sparkline point/area geometry (kept out of the component)
    color.ts         deterministic color hash for icon monograms
    *.test.ts        Vitest unit tests
  types/
    market.ts        typed CoinGecko contract + domain types
  App.tsx            screen composition + local UI state
  main.tsx           QueryClientProvider
```

Server state lives entirely in TanStack Query (`useMarketData`); UI state (search,
sort, expanded row) is local React state. No global state library - it isn't needed
for a single screen.

---

## Known limitations / unfinished parts

- **Single page of data.** We load the top 100 by market cap (`per_page=100`). There's
  no pagination/infinite scroll to deeper ranks. The mock generates 150 rows to
  exercise virtualization at a larger scale than the live page.
- **Rate limits & CORS.** The free CoinGecko tier rate-limits (HTTP 429) and may hit
  CORS from some hosted origins. The mock fallback and Live/Demo switch exist so the
  tool always stays explorable; there's no API key / proxy layer.
- **USD only.** No currency switcher.
- **Tests cover pure logic, not components.** Formatters, market logic, sparkline geometry,
  and the color hash are unit-tested (31 tests). Component/interaction tests (RTL + jsdom)
  were out of scope for the time box.
- **Partial table ARIA semantics.** Rows use `role="row"` / `role="rowgroup"`, but the table
  isn't a full ARIA grid — there's no `role="grid"` wrapper or `role="columnheader"` tying
  the sortable header to the rows for assistive tech. A known, deliberate gap given the time
  box; the upgrade is small and localized to `MarketTable` / `TableHeader`.
- **Sparklines are intentionally minimal** — a single trend line with no axes/tooltips,
  chosen for per-row render cost over richness.
- **Header/body column alignment** relies on a shared CSS grid; on very narrow screens
  the table scrolls horizontally as a unit.
# cryptomarket
