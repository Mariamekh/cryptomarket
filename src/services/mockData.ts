import type { Coin } from "../types/market";

function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeSparkline(rng: () => number, start: number, pct7d: number): number[] {
  const points = 168;
  const end = start * (1 + pct7d / 100);
  const prices: number[] = [];
  for (let i = 0; i < points; i++) {
    const trend = start + ((end - start) * i) / (points - 1);
    const noise = trend * (rng() - 0.5) * 0.04;
    prices.push(Math.max(0, trend + noise));
  }
  return prices;
}

const SEED_COINS: Array<{ name: string; symbol: string; price: number }> = [
  { name: "Bitcoin", symbol: "btc", price: 67000 },
  { name: "Ethereum", symbol: "eth", price: 3500 },
  { name: "Tether", symbol: "usdt", price: 1.0 },
  { name: "BNB", symbol: "bnb", price: 600 },
  { name: "Solana", symbol: "sol", price: 165 },
  { name: "USDC", symbol: "usdc", price: 1.0 },
  { name: "XRP", symbol: "xrp", price: 0.52 },
  { name: "Dogecoin", symbol: "doge", price: 0.14 },
  { name: "Toncoin", symbol: "ton", price: 7.1 },
  { name: "Cardano", symbol: "ada", price: 0.45 },
  { name: "Avalanche", symbol: "avax", price: 36 },
  { name: "Shiba Inu", symbol: "shib", price: 0.000025 },
  { name: "TRON", symbol: "trx", price: 0.12 },
  { name: "Polkadot", symbol: "dot", price: 7.2 },
  { name: "Chainlink", symbol: "link", price: 17.5 },
  { name: "Bitcoin Cash", symbol: "bch", price: 480 },
  { name: "NEAR Protocol", symbol: "near", price: 7.4 },
  { name: "Polygon", symbol: "matic", price: 0.72 },
  { name: "Litecoin", symbol: "ltc", price: 84 },
  { name: "Internet Computer", symbol: "icp", price: 12.3 },
  { name: "Uniswap", symbol: "uni", price: 9.8 },
  { name: "Dai", symbol: "dai", price: 1.0 },
  { name: "Aptos", symbol: "apt", price: 8.9 },
  { name: "Stellar", symbol: "xlm", price: 0.11 },
  { name: "Cosmos Hub", symbol: "atom", price: 8.4 },
];

const SYNTH_NAMES = [
  "Helix", "Aurora", "Nimbus", "Quark", "Vertex", "Lumen", "Pulsar", "Cobalt",
  "Zephyr", "Onyx", "Mirage", "Aether", "Drift", "Flux", "Ember", "Cipher",
  "Halo", "Tundra", "Vortex", "Prism", "Nova", "Atlas", "Echo", "Gravity",
];

const STABLECOINS = new Set(["usdt", "usdc", "dai"]);

let demoTick = 0;

export function generateMockMarket(count = 150): Coin[] {
  demoTick++;
  const coins: Coin[] = [];
  for (let i = 0; i < count; i++) {
    const rng = makeRng(i * 2654435761 + 1);
    const seed = SEED_COINS[i];
    const name =
      seed?.name ??
      `${SYNTH_NAMES[i % SYNTH_NAMES.length]} ${SYNTH_NAMES[(i * 7) % SYNTH_NAMES.length]}`;
    const symbol =
      seed?.symbol ?? `${SYNTH_NAMES[i % SYNTH_NAMES.length].slice(0, 3)}${i}`.toLowerCase();
    const basePrice = seed?.price ?? Math.max(0.0001, 200 * Math.pow(rng(), 3));
    const price =
      demoTick === 1 ? basePrice : basePrice * (1 + (Math.random() - 0.5) * 0.012);

    const isStable = STABLECOINS.has(symbol);
    const swing = isStable ? 0.15 : 14;
    const pct1h = isStable ? (rng() - 0.5) * 0.1 : (rng() - 0.5) * swing * 0.5;
    const pct24h = isStable ? (rng() - 0.5) * 0.2 : (rng() - 0.5) * swing;
    const pct7d = isStable ? (rng() - 0.5) * 0.4 : (rng() - 0.5) * swing * 2;

    const marketCap = price * (5e9 / (i + 1)) * (0.6 + rng());
    const volume = marketCap * (0.02 + rng() * 0.12);
    const supply = marketCap / price;

    coins.push({
      id: `${symbol}-${i}`,
      symbol,
      name,
      image: "",
      current_price: price,
      market_cap: marketCap,
      market_cap_rank: i + 1,
      total_volume: volume,
      high_24h: price * (1 + Math.abs(pct24h) / 100),
      low_24h: price * (1 - Math.abs(pct24h) / 100),
      circulating_supply: supply,
      total_supply: supply * (1 + rng() * 0.3),
      ath: price * (1.2 + rng() * 3),
      atl: price * (0.05 + rng() * 0.3),
      price_change_percentage_1h_in_currency: pct1h,
      price_change_percentage_24h_in_currency: pct24h,
      price_change_percentage_7d_in_currency: pct7d,
      sparkline_in_7d: { price: makeSparkline(rng, price, pct7d) },
    });
  }
  return coins;
}
