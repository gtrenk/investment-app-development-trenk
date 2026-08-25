import { describe, expect, it } from 'vitest'
import {
  isValidIndex,
  isValidWindow,
  lastCloseReturn,
  seriesLength,
  sliceSeries,
  validateSeries,
} from '@core/market/bundled'
import type { OhlcvSeries } from '@core/types'

/** Small hand-built series: closes 100, 110, 99, 105, 120. */
function fixture(): OhlcvSeries {
  return {
    symbol: 'TEST',
    interval: '1d',
    t: [1_700_000_000, 1_700_086_400, 1_700_172_800, 1_700_259_200, 1_700_345_600],
    o: [100, 101, 110, 98, 106],
    h: [102, 112, 111, 106, 121],
    l: [99, 100, 98, 97, 104],
    c: [100, 110, 99, 105, 120],
    v: [1000, 2000, 3000, 4000, 5000],
  }
}

describe('seriesLength / index validation', () => {
  it('reports the bar count', () => {
    expect(seriesLength(fixture())).toBe(5)
  })

  it.each([
    [0, true],
    [4, true],
    [5, false],
    [-1, false],
    [1.5, false],
    [Number.NaN, false],
  ])('isValidIndex(%s) === %s', (idx, expected) => {
    expect(isValidIndex(fixture(), idx)).toBe(expected)
  })

  it.each([
    [0, 4, true],
    [2, 2, true], // single-bar window is legal
    [3, 2, false], // inverted
    [0, 5, false], // past the end
    [-1, 3, false],
  ])('isValidWindow(%i, %i) === %s', (a, b, expected) => {
    expect(isValidWindow(fixture(), a, b)).toBe(expected)
  })
})

describe('sliceSeries', () => {
  it('returns the inclusive window', () => {
    const w = sliceSeries(fixture(), 1, 3)
    expect(w.c).toEqual([110, 99, 105])
    expect(w.o).toEqual([101, 110, 98])
    expect(w.h).toEqual([112, 111, 106])
    expect(w.l).toEqual([100, 98, 97])
    expect(w.v).toEqual([2000, 3000, 4000])
    expect(w.t).toHaveLength(3)
  })

  it('carries symbol and interval through', () => {
    const w = sliceSeries(fixture(), 0, 0)
    expect(w.symbol).toBe('TEST')
    expect(w.interval).toBe('1d')
    expect(w.c).toEqual([100])
  })

  it('copies the whole series when asked for the full range', () => {
    const s = fixture()
    const w = sliceSeries(s, 0, 4)
    expect(w.c).toEqual(s.c)
  })

  it('does not alias the source arrays', () => {
    const s = fixture()
    const w = sliceSeries(s, 0, 4)
    w.c[0] = 999
    expect(s.c[0]).toBe(100)
  })

  it.each([
    [3, 2],
    [0, 5],
    [-1, 2],
    [5, 5],
  ])('throws on out-of-bounds window [%i, %i]', (a, b) => {
    expect(() => sliceSeries(fixture(), a, b)).toThrow(RangeError)
  })
})

describe('lastCloseReturn', () => {
  it('computes a positive fractional return', () => {
    // c[0]=100 → c[1]=110
    expect(lastCloseReturn(fixture(), 0, 1)).toBeCloseTo(0.1, 10)
  })

  it('computes a negative fractional return', () => {
    // c[1]=110 → c[2]=99
    expect(lastCloseReturn(fixture(), 1, 1)).toBeCloseTo(-0.1, 10)
  })

  it('spans multiple bars', () => {
    // c[0]=100 → c[4]=120
    expect(lastCloseReturn(fixture(), 0, 4)).toBeCloseTo(0.2, 10)
  })

  it('is zero when the closes match', () => {
    const s = fixture()
    s.c[4] = s.c[0]
    expect(lastCloseReturn(s, 0, 4)).toBe(0)
  })

  it('throws when the horizon runs past the end', () => {
    expect(() => lastCloseReturn(fixture(), 4, 1)).toThrow(RangeError)
    expect(() => lastCloseReturn(fixture(), 0, 5)).toThrow(RangeError)
  })

  it('throws on a non-positive or non-integer horizon', () => {
    expect(() => lastCloseReturn(fixture(), 0, 0)).toThrow(RangeError)
    expect(() => lastCloseReturn(fixture(), 0, -1)).toThrow(RangeError)
    expect(() => lastCloseReturn(fixture(), 0, 1.5)).toThrow(RangeError)
  })

  it('throws on an invalid cutoff', () => {
    expect(() => lastCloseReturn(fixture(), -1, 1)).toThrow(RangeError)
  })
})

describe('validateSeries', () => {
  it('accepts a well-formed series', () => {
    expect(validateSeries(fixture())).toEqual([])
  })

  it('rejects mismatched column lengths', () => {
    const s = fixture()
    s.c = s.c.slice(0, 3)
    expect(validateSeries(s)[0]).toMatch(/c\.length/)
  })

  it('rejects h < max(o, c)', () => {
    const s = fixture()
    s.h[2] = 50
    expect(validateSeries(s)[0]).toMatch(/h < max/)
  })

  it('rejects l > min(o, c)', () => {
    const s = fixture()
    s.l[2] = 500
    expect(validateSeries(s)[0]).toMatch(/l > min/)
  })

  it('rejects non-positive prices', () => {
    const s = fixture()
    s.l[1] = 0
    expect(validateSeries(s)[0]).toMatch(/finite and positive/)
  })

  it('rejects NaN prices', () => {
    const s = fixture()
    s.c[3] = Number.NaN
    expect(validateSeries(s)[0]).toMatch(/finite and positive/)
  })

  it('rejects negative volume', () => {
    const s = fixture()
    s.v[0] = -1
    expect(validateSeries(s)[0]).toMatch(/invalid volume/)
  })

  it('rejects non-increasing timestamps', () => {
    const s = fixture()
    s.t[3] = s.t[2]
    expect(validateSeries(s)[0]).toMatch(/strictly increasing/)
  })

  it('rejects an empty series', () => {
    const s = fixture()
    s.t = []; s.o = []; s.h = []; s.l = []; s.c = []; s.v = []
    expect(validateSeries(s)).toContain('TEST: empty series')
  })
})
