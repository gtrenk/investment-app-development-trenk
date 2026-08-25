import type { Lesson, LessonId, Unit, UnitId } from '@core/types'
import { u01 } from './u01-foundations'
import { u02 } from './u02-mechanics'
import { u03 } from './u03-income-statement'
import { u04 } from './u04-balance-cashflow'
import { u05 } from './u05-ratios'
import { u06 } from './u06-valuation-multiples'
import { u07 } from './u07-valuation-dcf'
import { u08 } from './u08-technical-foundations'
import { u09 } from './u09-chart-patterns'
import { u10 } from './u10-indicators'
import { u11 } from './u11-risk'
import { u12 } from './u12-behavioral'
import { u13 } from './u13-strategy'
import { u14 } from './u14-expert'

/**
 * Every authored unit, in curriculum order.
 * Add new units here as they are written — nothing else needs to change.
 */
export const ALL_UNITS: Unit[] = [u01, u02, u03, u04, u05, u06, u07, u08, u09, u10, u11, u12, u13, u14].sort((a, b) => a.order - b.order)

/** Every lesson across every unit, flattened in unit order then lesson order. */
export const ALL_LESSONS: Lesson[] = ALL_UNITS.flatMap((unit) =>
  [...unit.lessons].sort((a, b) => a.order - b.order),
)

const UNIT_BY_ID = new Map<UnitId, Unit>(ALL_UNITS.map((u) => [u.id, u]))
const LESSON_BY_ID = new Map<LessonId, Lesson>(ALL_LESSONS.map((l) => [l.id, l]))

/** Look up a unit by id, e.g. 'u01'. Returns undefined if it does not exist. */
export function getUnit(id: UnitId): Unit | undefined {
  return UNIT_BY_ID.get(id)
}

/** Look up a lesson by id, e.g. 'u01-l01'. Returns undefined if it does not exist. */
export function getLesson(id: LessonId): Lesson | undefined {
  return LESSON_BY_ID.get(id)
}

export { u01, u02, u03, u04, u05, u06, u07, u08, u09, u10, u11, u12, u13, u14 }
