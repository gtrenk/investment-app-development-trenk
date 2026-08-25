import { ComingSoon } from '@ui/components/ComingSoon'

export function DrillsScreen() {
  return (
    <ComingSoon
      icon="📈"
      title="Drills"
      tagline="Pattern recognition, what-happens-next, and read-the-financials — with calibration scoring."
      bullets={[
        'Spot the pattern on real historical charts, then see the trendlines overlaid',
        'Call the next 10 bars with a confidence level — trains probabilistic thinking',
        'Compute ratios from real statement snapshots against a tolerance band',
      ]}
      note="One drill a day counts toward your streak once this ships."
    />
  )
}
