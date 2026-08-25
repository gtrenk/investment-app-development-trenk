import { ComingSoon } from '@ui/components/ComingSoon'

export function PortfolioScreen() {
  return (
    <ComingSoon
      icon="💼"
      title="Portfolio"
      tagline="$100,000 of virtual cash, real delayed quotes, and a shadow S&P 500 benchmark that never lets you fool yourself."
      bullets={[
        'Market orders with fractional shares, filled at the quote you were shown',
        'FIFO lots, realized and unrealized P&L, concentration warnings',
        'Equity vs. SPY chart from daily snapshots — beat the street, or find out',
      ]}
      note="Paper trading arrives after the drills update."
    />
  )
}
