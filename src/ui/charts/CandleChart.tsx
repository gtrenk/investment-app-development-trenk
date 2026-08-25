// ─── CandleChart ─────────────────────────────────────────────────────────────
// The *only* place lightweight-charts is imported. Everything else in the app
// talks to this component, so swapping the library (or rendering on native)
// touches one file.
//
// Deliberately non-interactive: scroll/scale/crosshair are off so a drag on a
// phone scrolls the page instead of panning the chart, and `fitContent` keeps
// the whole drill window on screen at all times.

import { useEffect, useRef } from 'react'
import {
  ColorType,
  createChart,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import type { OhlcvSeries } from '@core/types'

// Palette lifted from the app's Tailwind theme so the canvas matches the DOM.
const UP = '#34d399' // emerald-400
const DOWN = '#f43f5e' // rose-500
const GRID = 'rgba(30, 41, 59, 0.7)' // slate-800
const AXIS_TEXT = '#64748b' // slate-500
const BORDER = '#1e293b' // slate-800

/** Milliseconds between revealed bars. Fast enough not to bore, slow enough to read. */
export const REVEAL_INTERVAL_MS = 40

/** Credit for the rendering library, shown once under each chart frame. */
export const ATTRIBUTION = 'Charts by TradingView Lightweight Charts™'

interface Props {
  series: OhlcvSeries
  /** Chart height in CSS pixels (the width always fills the container). */
  height?: number
  /**
   * Index **into `series`** of the last bar shown immediately. Bars after it
   * animate in one at a time. Omit to draw the whole series at once.
   */
  revealFrom?: number
  className?: string
}

function candles(series: OhlcvSeries): CandlestickData<UTCTimestamp>[] {
  return series.t.map((t, i) => ({
    time: t as UTCTimestamp,
    open: series.o[i],
    high: series.h[i],
    low: series.l[i],
    close: series.c[i],
  }))
}

function volumes(series: OhlcvSeries): HistogramData<UTCTimestamp>[] {
  return series.t.map((t, i) => ({
    time: t as UTCTimestamp,
    value: series.v[i],
    // Same up/down read as the candle above it, but muted so it stays background.
    color: series.c[i] >= series.o[i] ? 'rgba(52, 211, 153, 0.35)' : 'rgba(244, 63, 94, 0.35)',
  }))
}

export function CandleChart({ series, height = 260, revealFrom, className = '' }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null)

  // ── Create once, destroy on unmount ──
  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const chart = createChart(host, {
      width: host.clientWidth || 320,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: AXIS_TEXT,
        fontSize: 10,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        // The in-canvas logo lands on top of the volume bars at 390px wide and
        // reads as a rendering glitch. Attribution moves to the frame below —
        // see `ATTRIBUTION`.
        attributionLogo: false,
      },
      grid: { vertLines: { color: GRID }, horzLines: { color: GRID } },
      rightPriceScale: {
        borderColor: BORDER,
        // Headroom at the top so the highest price label is not clipped by the
        // canvas edge; the bottom quarter belongs to the volume overlay.
        scaleMargins: { top: 0.14, bottom: 0.26 },
      },
      timeScale: {
        borderColor: BORDER,
        timeVisible: false,
        secondsVisible: false,
        fixLeftEdge: true,
        rightOffset: 1,
      },
      // No crosshair at all — including the axis labels it parks on the last
      // bar, which read as a live quote on a historical drill chart.
      crosshair: {
        horzLine: { visible: false, labelVisible: false },
        vertLine: { visible: false, labelVisible: false },
      },
      // A phone gesture belongs to the page, not to the chart.
      handleScroll: false,
      handleScale: false,
      kineticScroll: { touch: false, mouse: false },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: UP,
      downColor: DOWN,
      borderUpColor: UP,
      borderDownColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    // Overlay rather than a second pane: at 390px wide a split pane leaves the
    // candles too short to read.
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'tq-volume',
      priceLineVisible: false,
      lastValueVisible: false,
    })
    chart
      .priceScale('tq-volume')
      .applyOptions({ scaleMargins: { top: 0.78, bottom: 0 }, visible: false })

    chartRef.current = chart
    candleRef.current = candleSeries
    volumeRef.current = volumeSeries

    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0]?.contentRect.width ?? 0)
      if (w > 0) chart.applyOptions({ width: w })
    })
    ro.observe(host)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      candleRef.current = null
      volumeRef.current = null
    }
    // `height` is applied by its own effect below so a resize never rebuilds the chart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    chartRef.current?.applyOptions({ height })
  }, [height])

  // ── Data + reveal animation ──
  useEffect(() => {
    const chart = chartRef.current
    const candleSeries = candleRef.current
    const volumeSeries = volumeRef.current
    if (!chart || !candleSeries || !volumeSeries) return

    const bars = candles(series)
    const vols = volumes(series)
    const n = bars.length
    // No reveal (or one past the end) means "draw everything now".
    const cut = revealFrom === undefined ? n - 1 : Math.max(-1, Math.min(n - 1, Math.floor(revealFrom)))
    const shown = cut + 1

    candleSeries.setData(bars.slice(0, shown))
    volumeSeries.setData(vols.slice(0, shown))
    chart.timeScale().fitContent()

    if (shown >= n) return

    // Append the hidden tail one bar at a time. `update` (not `setData`) so the
    // chart animates the new bar in instead of redrawing the whole window.
    let i = shown
    const timer = window.setInterval(() => {
      if (i >= n) {
        window.clearInterval(timer)
        chart.timeScale().fitContent()
        return
      }
      candleSeries.update(bars[i])
      volumeSeries.update(vols[i])
      i++
    }, REVEAL_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [series, revealFrom])

  return (
    <div
      ref={hostRef}
      data-testid="candle-chart"
      // No `data-symbol`: what-next drills must not leak the ticker, not even
      // into the DOM.
      data-bars={series.t.length}
      className={`w-full overflow-hidden ${className}`}
      style={{ height }}
    />
  )
}
