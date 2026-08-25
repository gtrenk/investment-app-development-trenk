// ─── The tradable universe ───────────────────────────────────────────────────
// Paper trading is limited to the symbols that ship with the app, because every
// one of them must be priceable offline: the bundled provider is the fallback
// that makes a fill possible with no network, and it can only quote a symbol
// whose `public/data/ohlcv/{SYMBOL}.json` was precached by the service worker.
//
// The symbol list mirrors `public/data/manifest.json` (and `DEFAULT_SYMBOLS` in
// scripts/fetch-data.mjs, which produced it). Names and sectors live only here —
// the manifest carries bar counts, not labels — and are display copy, nothing
// keys off them.

export interface TradableSymbol {
  symbol: string
  name: string
  sector: string
}

/** 27 liquid US listings, in the order the data pipeline fetches them. */
export const UNIVERSE: TradableSymbol[] = [
  { symbol: 'AAPL', name: 'Apple', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon', sector: 'Consumer' },
  { symbol: 'GOOG', name: 'Alphabet', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla', sector: 'Consumer' },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financials' },
  { symbol: 'BAC', name: 'Bank of America', sector: 'Financials' },
  { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron', sector: 'Energy' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer', sector: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth', sector: 'Healthcare' },
  { symbol: 'WMT', name: 'Walmart', sector: 'Consumer' },
  { symbol: 'COST', name: 'Costco', sector: 'Consumer' },
  { symbol: 'KO', name: 'Coca-Cola', sector: 'Consumer' },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer' },
  { symbol: 'DIS', name: 'Walt Disney', sector: 'Communication' },
  { symbol: 'NFLX', name: 'Netflix', sector: 'Communication' },
  { symbol: 'BA', name: 'Boeing', sector: 'Industrials' },
  { symbol: 'CAT', name: 'Caterpillar', sector: 'Industrials' },
  { symbol: 'HD', name: 'Home Depot', sector: 'Consumer' },
  { symbol: 'V', name: 'Visa', sector: 'Financials' },
  { symbol: 'MA', name: 'Mastercard', sector: 'Financials' },
  { symbol: 'SPY', name: 'S&P 500 ETF', sector: 'Index fund' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', sector: 'Index fund' },
]

/** The symbol the shadow benchmark is priced in. */
export const BENCHMARK_SYMBOL = 'SPY'

export const TRADABLE_SYMBOLS: string[] = UNIVERSE.map((u) => u.symbol)

const BY_SYMBOL = new Map(UNIVERSE.map((u) => [u.symbol, u]))

export function isTradable(symbol: string): boolean {
  return BY_SYMBOL.has(String(symbol ?? '').trim().toUpperCase())
}

/** Display name for a symbol; falls back to the symbol itself. */
export function symbolName(symbol: string): string {
  return BY_SYMBOL.get(String(symbol ?? '').trim().toUpperCase())?.name ?? symbol
}

/**
 * Filter the universe by a free-text query against symbol *and* name, so both
 * "nvda" and "nvidia" find the same tile. An empty query returns everything.
 */
export function searchUniverse(query: string): TradableSymbol[] {
  const q = String(query ?? '').trim().toLowerCase()
  if (q === '') return UNIVERSE
  return UNIVERSE.filter(
    (u) => u.symbol.toLowerCase().includes(q) || u.name.toLowerCase().includes(q),
  )
}
