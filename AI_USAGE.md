# AI Usage

I used AI for this task. It's allowed, so here is the honest version of how I worked.

I did not just type "build the app" and ship what came back. I wrote the brief, set the
architecture choices, reviewed at checkpoints, and verified the result. The agent did most of
the typing. The direction and the calls were mine.

## Tools

- Claude, as a planning partner, to define the product direction before any code.
- Claude Code (the agent), to implement the app from that plan.

## What I asked first

My first ask wasn't "write the app." It was to help me define the problem. I worked out the
core idea first - scan fast first, top movers before the full table - and the order of work:
data and states first, polish last. Only then did I turn that into a build brief.

## How the direction changed

A few things shifted while I worked.

After re-reading the job description, I raised the priority of the refresh/stale handling and
the reusable components, because the role is about real-time market data. So I told the agent
to treat the no-flicker refresh as a core feature, not a detail.

I also added one rule early: clarity over cleverness, no premature abstraction. I didn't want
a timed task turning into an over-engineered one. And I split the build into checkpoints so I
could stop it before it ran too far in one direction.

## What I accepted

- TanStack Query as the single owner of server state, with keepPreviousData for the
  no-flicker refresh.
- Virtualizing the table, and memoizing rows with a field-level comparator.
- Inline SVG sparklines instead of a chart library per row.

I accepted these because they're how I'd build it for production anyway, and they answer the
performance and real-time parts of the task.

## What I rejected

I said no to a global state store. For one screen, the query cache plus local UI state is
simpler and has fewer bugs. I also dropped the extra visual-polish ideas - the task grades
judgment over looks, and I needed that time for states and performance. And I stopped the
agent from splitting small components into more files than they were worth.

## Where AI was wrong or incomplete

The generated test factory had a real bug. It spread an object and then set id again, which
left a duplicate key and broke the TypeScript build. It looked fine at a glance but didn't
compile. I caught it from the build error and had the duplicate removed.

The early hosting advice was also incomplete. It didn't flag that CoinGecko rate-limits and
can hit CORS from a hosted page. I noticed that myself and added the mock fallback and the
Live/Demo switch, so the demo always shows something.

One smaller thing, on me as much as the AI: I almost shipped the Live/Demo toggle disabled
during a fetch, copying the Refresh button's behavior. Then I realised switching source should
just work mid-fetch, so I left it enabled and made sure it stays smooth. I also spent longer
than I should have on the sparkline comparator before deciding that comparing the last point
was enough.

The refresh feedback was the same kind of catch. The first version fetched and updated
correctly, but the "Refreshing" indicator flashed by too fast to see - and because live prices
barely move between calls, nothing on screen confirmed it had worked. I only noticed by
clicking Refresh myself. So I had it hold the indicator for a short minimum and then show a
brief "Updated just now" confirmation (tied to the data timestamp actually changing, so an
error never shows a false success), which is the kind of gap you only find by using the thing,
not by reading it.

## What I decided, fixed, or verified myself

I decided the product shape (movers first), the order of work, and the polling-vs-WebSocket
tradeoff. I caught and directed the fix for the duplicate-id test bug, and added the
mock-fallback plan for hosting. I kept the scope small on purpose.

I should be honest about the limits of my review too. I checked behavior and types at each
checkpoint, but on a 90-minute clock I prioritised verifying that it runs, builds, and behaves
correctly over reading every single line. The pure logic in lib/ is unit-tested; the
components I checked by using them.

## How I checked the final result

- npm run build passes - tsc with 0 type errors, ~83 kB gzip JS.
- npm run test - 31 of 31 pass (formatters, movers, sort/filter, sort-toggle, sparkline geometry, color hash).
- npm run dev served and returned 200. I clicked through loading, error, refresh, search,
  sort, and row expand by hand.
- Confirmed the live CoinGecko path works and the mock fallback triggers on error.
