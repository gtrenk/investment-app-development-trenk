// ─── IndexedDB storage adapter ───────────────────────────────────────────────
// The web implementation of core's StorageAdapter, backed by idb-keyval.

import { createStore, get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import type { StorageAdapter } from '@core/storage/adapter'

/** Dedicated database so TickerQuest never collides with other origin data. */
const store = createStore('tickerquest', 'kv')

export const idbStorage: StorageAdapter = {
  async get<T>(key: string): Promise<T | undefined> {
    return (await idbGet<T>(key, store)) ?? undefined
  },
  async set<T>(key: string, value: T): Promise<void> {
    await idbSet(key, value, store)
  },
  async del(key: string): Promise<void> {
    await idbDel(key, store)
  },
}
