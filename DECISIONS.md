# Decisions

Notes on what I prioritized, the tradeoffs I made, and why - for a single-screen
market exploration tool built under a time limit.

---

## What I prioritized in the UI

The core question a user has when they open a market tool is **"what's happening
right now, and where should I look?"** - not "show me a spreadsheet." So I designed
top-down by urgency:

1. **Movement first.** A **Top Movers** strip (5 gainers + 5 losers by 24h) sits above
   everything. It's the fastest possible read on market direction and where the action is.
2. **Scannable table second.** The top 100 by market cap, with the signals that matter
   for a quick scan: price, **multi-window % change (1h / 24h / 7d)** color-coded
   green/red, market cap, and a **7-day sparkline** so trend is visible without a click.
3. **Detail on demand.** Everything else (volume, 24h range, supply, ATH, a bigger chart)
   is one click away in an inline expansion, so the default view stays dense and calm.

I deliberately showed **three change windows** rather than one. A coin up on the day but
down on the week tells a different story than one up on both - that contrast is most of
the "sensemaking," and it's cheap to show.

I treated **trustworthiness of the data as a first-class UI concern**, not an afterthought:
where the numbers come from (LIVE/DEMO), how fresh they are, and whether they're currently
refreshing are always visible. For a real-time-ish tool, "can I trust this number" matters
as much as the number.

I explicitly did **not** chase visual polish. The task grades judgment and architecture
over looks, so time went to states, data handling, and performance instead.

---

## Folder structure - and why not feature-based

I used a flat, layered structure (`components/` · `hooks/` · `lib/` · `types/`) because this
is a **single feature**. For a larger app I would move to feature-based folders (e.g.
`features/market/` owning its own components, hooks, and logic, with a `shared/` layer for
cross-cutting primitives) so each feature is self-contained. At this size that would add
structure without benefit, so I deliberately kept it flat - knowing when *not* to reach for
the bigger pattern matters as much as knowing the pattern.

What I did insist on, independent of folder layout, is **separation of concerns**: pure
logic lives in `lib/` (`market.ts` sorting/filtering/movers, `format.ts`, `sparkline.ts`
geometry, `color.ts`) outside of components and is unit-tested on its own, server state is
isolated in one hook, and components stay presentational. That keeps the code easy to test
and easy to lift into feature folders later if the app grows.

---

## Why this data-fetching approach (TanStack Query)

**All server state lives in TanStack Query**, behind one `useMarketData` hook. The hook
owns fetching, caching, the 60s auto-refresh, stale tracking, and retry policy; components
just consume the result. Reasons:

- **It models exactly this problem.** Cached server data that goes stale and needs periodic
  background refresh is precisely what the library is for. Re-implementing caching, polling,
  dedup, and request cancellation by hand would be more code and more bugs.
- **`keepPreviousData` gives no-flicker refresh.** On the 60s refetch (and on Live/Demo
  switches), the previous rows stay on screen while the next load resolves, so the table
  never blanks or flashes. This was a specific goal - a market table that strobes every
  minute is unusable.
- **Honest failure with graceful degradation.** The API client *throws* on failure so a real
  error state surfaces (with Retry). The decision to fall back to mock data is made one layer
  up and is **user-initiated** (or env-forced) — so a failure is never silently hidden, but
  the tool still stays explorable via the "Use demo data" path.
- **Retry policy tuned to the source.** Transient errors retry twice; a 429 rate limit does
  **not** retry (hammering a rate-limited endpoint just deepens the limit).
- **Which controls disable during a fetch.** Refresh is disabled while fetching (it would
  just re-request the same data), but the Live/Demo toggle stays enabled — switching source
  is a deliberate intent, each source is cached (30s `staleTime`) so toggling is usually
  instant, and changing the query key supersedes any in-flight request without a flicker.
- **A refresh you can actually see.** A real fetch often resolves in a few hundred ms, which
  blinks past — and since live prices barely move between calls, nothing visibly changes to
  confirm it worked. So the "Refreshing…" state is held for a minimum ~600ms and followed by
  a brief "✓ Updated just now" confirmation, gated on `dataUpdatedAt` actually changing (so an
  error never shows a false confirmation). Here, trustworthy *"it updated"* feedback matters
  more than shaving the last few hundred ms.

**UI state stays local and minimal** (search text, sort column, expanded row are `useState`
in `App`). For one screen, server cache + local UI state is simpler and less bug-prone than
introducing a global store, so I rejected adding one.

---

## Why this visualization approach (inline SVG sparklines)

I used **hand-rolled inline-SVG sparklines**, not a chart library, for the per-row trend.

- **Per-row cost is the whole game.** 100+ rows each render a chart. A charting library
  (recharts, etc.) carries real per-instance overhead and bundle weight; an SVG `<polyline>`
  is a handful of nodes with effectively zero library cost. This keeps scrolling smooth.
- **It's enough signal.** For scanning, the *shape and direction* of the last 7 days is what
  matters — not axes, gridlines, or tooltips. The line is auto-colored green/red by whether
  the window closed up or down, matching the % columns.
- **Same component, two sizes.** The detail panel reuses the same `Sparkline` at a larger
  size, so there's one implementation to reason about.

The tradeoff: no hover tooltips or precise value read-off on the chart. That's an acceptable
loss for a v1 scan tool, and the exact 7d number is shown numerically right next to it.

---

## How I handled interaction and exploration

Three interactions, each chosen to support fast scanning rather than to add surface area:

- **Search** by name or symbol, **debounced (200ms)** so filtering stays off the typing hot path.
- **Sort** by clicking any numeric column header; direction toggles on re-click, with
  sensible defaults (prices/%/caps start descending, name/rank ascending). Missing values
  always sink to the bottom so a coin with null data never fakes the "top mover" slot.
- **Expand** a row (click or keyboard) to reveal detail inline, keeping context instead of
  navigating away.
- **Movers are interactive** — clicking one filters the table to that coin and expands it,
  connecting the "what's moving" overview to the detailed view.

---

## Performance concerns I considered

This is where most of the engineering effort went, because the data refreshes on a timer
and the list is meant to scale.

- **Virtualized rows** (`@tanstack/react-virtual`). Only the visible window is mounted, so
  the DOM stays small regardless of row count. Heights are measured dynamically so an
  expanded row's detail panel reflows correctly without hard-coding two sizes.
- **Scoped re-renders on refresh.** Every 60s refetch produces a brand-new array of coin
  objects. A default memo would re-render all 100 rows. `MarketRow` is memoized with a
  **field-level comparator** that compares only the values it actually displays, so a refresh
  re-renders just the handful of coins whose numbers moved. For the sparkline I compare only
  the **last point** as a cheap "did the chart change" proxy — diffing all ~168 points every
  render would cost more than the occasional missed update it would catch.
- **Stable callbacks.** Row toggle / sort handlers are `useCallback`-stable so they don't
  bust row memoization.
- **Memoized derivations.** `filter → sort` runs in `useMemo`, so a background refresh that
  doesn't change inputs doesn't recompute, and typing only re-runs the filter.
- **Isolated ticking clock.** The "Updated Xs ago" label has its own 1s timer in its own
  component, so the clock re-renders only itself, never the table.
- **One request, many signals.** The % windows and sparkline come from the single markets
  call, so the screen costs one network round-trip per refresh.

---

## What I'd improve with more time

- **Deeper data / pagination.** Load beyond the top 100 (infinite scroll or pages) so the
  virtualization pays off against a genuinely large dataset.
- **A small proxy / API key.** Removes the CORS + rate-limit fragility of calling CoinGecko
  directly from the browser, and would let me drop the mock-as-fallback to mock-as-tests-only.
- **Component & interaction tests.** Add RTL + jsdom coverage for sort/search/expand and the
  loading/error/stale branches; today only the pure logic is unit-tested.
- **Richer charts on demand.** Tooltips and selectable time ranges in the expanded detail
  (still keeping the row sparkline cheap).
- **Sticky/synced header on horizontal scroll**, a currency switcher, and persisting the
  user's sort/search in the URL for shareable views.
- **WebSocket prices** for the visible rows (e.g. Binance streams) layered on top of the
  REST snapshot, instead of 60s polling. I chose polling first because it's simpler, matches
  CoinGecko's REST model, and is the right tradeoff for a time-boxed v1.
