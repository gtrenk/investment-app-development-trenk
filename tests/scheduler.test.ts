import { describe, expect, it } from 'vitest'
import { buildQueue, DEFAULT_DUE_CAP, DEFAULT_NEW_CAP } from '@core/srs/scheduler'
import { newCardState } from '@core/srs/sm2'
import type { CardId, CardState } from '@core/types'

const TODAY = '2026-03-10'

function reviewed(cardId: CardId, due: string, introduced = '2026-01-01'): CardState {
  return {
    cardId,
    ease: 2.5,
    intervalDays: 6,
    reps: 2,
    lapses: 0,
    due,
    introduced,
    lastGrade: 4,
  }
}

function toMap(cards: CardState[]): Record<CardId, CardState> {
  return Object.fromEntries(cards.map((c) => [c.cardId, c]))
}

describe('due list', () => {
  it('includes cards due today or earlier, oldest first', () => {
    const states = toMap([
      reviewed('c-today', TODAY),
      reviewed('c-old', '2026-03-01'),
      reviewed('c-mid', '2026-03-05'),
      reviewed('c-future', '2026-03-20'),
    ])
    expect(buildQueue(states, TODAY).due).toEqual(['c-old', 'c-mid', 'c-today'])
  })

  it('excludes cards due after today', () => {
    const states = toMap([reviewed('a', '2026-03-11'), reviewed('b', '2026-12-31')])
    expect(buildQueue(states, TODAY).due).toEqual([])
  })

  it('breaks due-date ties deterministically by card id', () => {
    const states = toMap([reviewed('z', TODAY), reviewed('a', TODAY), reviewed('m', TODAY)])
    expect(buildQueue(states, TODAY).due).toEqual(['a', 'm', 'z'])
  })

  it('caps the due list, keeping the most overdue cards', () => {
    const cards = Array.from({ length: 50 }, (_, i) =>
      reviewed(`c${String(i).padStart(2, '0')}`, `2026-03-${String((i % 9) + 1).padStart(2, '0')}`),
    )
    const q = buildQueue(toMap(cards), TODAY)
    expect(q.due).toHaveLength(DEFAULT_DUE_CAP)
    expect(q.due[0]).toBe('c00') // due 2026-03-01

    const small = buildQueue(toMap(cards), TODAY, { dueCap: 3 })
    expect(small.due).toHaveLength(3)
  })
})

describe('new cards', () => {
  it('collects never-reviewed cards in introduction order, capped', () => {
    const cards = [
      newCardState('n3', '2026-03-03'),
      newCardState('n1', '2026-03-01'),
      newCardState('n2', '2026-03-02'),
      newCardState('n4', '2026-03-04'),
    ]
    const q = buildQueue(toMap(cards), TODAY, { newCap: 3 })
    expect(q.newCards).toEqual(['n1', 'n2', 'n3'])
  })

  it('defaults to a cap of 5', () => {
    const cards = Array.from({ length: 12 }, (_, i) =>
      newCardState(`n${String(i).padStart(2, '0')}`, '2026-03-01'),
    )
    expect(buildQueue(toMap(cards), TODAY).newCards).toHaveLength(DEFAULT_NEW_CAP)
  })

  it('ignores cards not yet introduced', () => {
    const cards = [newCardState('soon', '2026-03-11'), newCardState('now', TODAY)]
    expect(buildQueue(toMap(cards), TODAY).newCards).toEqual(['now'])
  })

  it('never puts a never-reviewed card in the due list', () => {
    const cards = [
      newCardState('new-1', '2026-01-01'), // due long ago, but never reviewed
      newCardState('new-2', '2026-02-01'),
      reviewed('old-1', '2026-02-15'),
    ]
    const q = buildQueue(toMap(cards), TODAY)
    expect(q.due).toEqual(['old-1'])
    expect(q.newCards).toEqual(['new-1', 'new-2'])
    expect(q.due.filter((id) => q.newCards.includes(id))).toEqual([])
  })

  it('treats a lapsed card with reps 0 as due, not new', () => {
    const lapsed: CardState = {
      ...newCardState('lapsed', '2026-01-01'),
      lapses: 1,
      intervalDays: 1,
      due: '2026-03-09',
      lastGrade: 0,
    }
    const q = buildQueue(toMap([lapsed]), TODAY)
    expect(q.due).toEqual(['lapsed'])
    expect(q.newCards).toEqual([])
  })
})

describe('empty inputs', () => {
  it('returns two empty lists', () => {
    expect(buildQueue({}, TODAY)).toEqual({ due: [], newCards: [] })
  })

  it('honours a zero cap', () => {
    const states = toMap([reviewed('a', TODAY)])
    expect(buildQueue(states, TODAY, { dueCap: 0 }).due).toEqual([])
  })
})
