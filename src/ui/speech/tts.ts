// ─── Text-to-speech, the browser half ────────────────────────────────────────
// A thin, defensive wrapper over window.speechSynthesis. Lives under src/ui/
// because it touches `window`; the text it speaks is prepared by the pure
// transformer in @core/speech/text.
//
// Web Speech is the least reliable API in the browser, so the whole module is
// written around its four well-known failure modes:
//
//   1. NOT THERE. Older Firefox on Android, some in-app webviews, and anything
//      running server-side have no speechSynthesis at all. Every entry point
//      checks and returns silently, so no caller ever needs a try/catch.
//   2. THE 15-SECOND CUT-OFF. Desktop Chrome stops an utterance that runs past
//      ~15s and fires neither `end` nor `error`. Long text is therefore split
//      at sentence boundaries into chunks of ~200 characters, each its own
//      utterance — which also gives the queue somewhere to be interrupted.
//   3. THE PAUSED-QUEUE BUG. The same engine silently pauses itself on long
//      queues; the standard workaround is a periodic resume() while speaking.
//   4. THE USER GESTURE. iOS refuses the first speak() unless it happens inside
//      a tap handler. Every entry point in the app is a tap (the Listen toggle,
//      Next, a quiz choice), and once the engine has spoken once, the chained
//      utterances that follow are allowed.
//
// State is a module singleton on purpose: there is exactly one speech engine
// per tab, so there is exactly one queue here, and any screen that mounts can
// stop whatever the last one started.

import { useSyncExternalStore } from 'react'

// ── Capability ───────────────────────────────────────────────────────────────

function engine(): SpeechSynthesis | null {
  try {
    if (typeof window === 'undefined') return null
    const s = window.speechSynthesis
    // Read lazily, never cached: the e2e suite installs a mock via
    // addInitScript, and a captured reference would miss it.
    return s && typeof s.speak === 'function' ? s : null
  } catch {
    return null
  }
}

export function isSupported(): boolean {
  return engine() !== null && typeof window !== 'undefined' && 'SpeechSynthesisUtterance' in window
}

// ── Chunking ─────────────────────────────────────────────────────────────────

/** Chrome drops anything past roughly fifteen seconds; ~200 chars stays under. */
export const MAX_CHUNK_CHARS = 200

/**
 * Sentence ends, but only where one really is: a full stop between two digits
 * is a decimal point, and splitting `0.001` in two makes a voice say "zero,
 * zero zero one". Hand-rolled rather than a lookbehind regex, which older
 * iOS Safari rejects at parse time — and this module must never fail to load.
 */
function splitSentences(text: string): string[] {
  const TERMINATORS = '.!?;:'
  const out: string[] = []
  let start = 0

  for (let i = 0; i < text.length; i++) {
    if (!TERMINATORS.includes(text[i])) continue
    // Swallow a run of them, so "?!" ends one sentence rather than two.
    let end = i
    while (end + 1 < text.length && TERMINATORS.includes(text[end + 1])) end++
    const after = text[end + 1]
    // Not followed by a space: a decimal, an ellipsis inside a word, a ratio.
    if (after !== undefined && !/\s/.test(after)) {
      i = end
      continue
    }
    out.push(text.slice(start, end + 1))
    let next = end + 1
    while (next < text.length && /\s/.test(text[next])) next++
    start = next
    i = next - 1
  }

  if (start < text.length) out.push(text.slice(start))
  return out.filter((s) => s.trim() !== '')
}

/**
 * Split long text into utterance-sized pieces.
 *
 * Sentence boundaries first, and only a word boundary as the last resort for a
 * single sentence longer than the cap — a cut mid-phrase is audible, so it is
 * the fallback rather than the strategy. Words are never dropped or reordered:
 * `chunks.join(' ')` is the input back.
 */
export function chunkForSpeech(text: string, max = MAX_CHUNK_CHARS): string[] {
  const clean = text.trim().replace(/\s+/g, ' ')
  if (clean === '') return []
  if (clean.length <= max) return [clean]

  const out: string[] = []
  let buf = ''

  const flush = () => {
    if (buf !== '') out.push(buf)
    buf = ''
  }

  const append = (piece: string) => {
    if (buf === '') buf = piece
    else if (buf.length + 1 + piece.length > max) {
      flush()
      buf = piece
    } else buf += ` ${piece}`
  }

  for (const sentence of splitSentences(clean)) {
    if (sentence.length <= max) {
      append(sentence)
      continue
    }
    flush()
    let line = ''
    for (const word of sentence.split(' ')) {
      if (line !== '' && line.length + 1 + word.length > max) {
        out.push(line)
        line = word
      } else line = line === '' ? word : `${line} ${word}`
    }
    buf = line
  }

  flush()
  return out
}

// ── Voice ────────────────────────────────────────────────────────────────────

/**
 * No voice picker in v1: the right answer for "read this to me in the car" is
 * the voice the phone already reads everything else in. We only step in when
 * the platform default would be the wrong *language*, preferring a locally
 * installed voice (network voices stall offline, which is half the point of a
 * lesson you listen to while driving).
 */
export function pickVoice(voices: SpeechSynthesisVoice[], language: string): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null
  const lang = language.toLowerCase()
  const base = lang.split('-')[0]
  const local = (v: SpeechSynthesisVoice) => v.localService
  const exact = voices.filter((v) => v.lang.toLowerCase().replace('_', '-') === lang)
  const sameLanguage = voices.filter((v) => v.lang.toLowerCase().startsWith(base))
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  for (const pool of [exact, sameLanguage, english]) {
    const chosen = pool.find(local) ?? pool[0]
    if (chosen) return chosen
  }
  return null
}

function currentVoice(): SpeechSynthesisVoice | null {
  const s = engine()
  if (!s || typeof s.getVoices !== 'function') return null
  try {
    const language =
      (typeof navigator !== 'undefined' && navigator.language) || 'en-US'
    return pickVoice(s.getVoices(), language)
  } catch {
    return null
  }
}

// ── Observable state ─────────────────────────────────────────────────────────

export interface SpeechState {
  speaking: boolean
  paused: boolean
}

let state: SpeechState = { speaking: false, paused: false }
const listeners = new Set<() => void>()

function setState(next: SpeechState): void {
  if (next.speaking === state.speaking && next.paused === state.paused) return
  state = next
  for (const l of listeners) l()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function snapshot(): SpeechState {
  return state
}

/** Re-renders the header's speaker button as the queue starts, pauses, ends. */
export function useSpeechState(): SpeechState {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

// ── The queue ────────────────────────────────────────────────────────────────

export interface SpeakOptions {
  /** 0.8 – 1.5 in the UI; passed through to the utterance. */
  rate?: number
  /** Fires once, after the last chunk of the last text. Never after a stop(). */
  onDone?: () => void
  /** Index into `texts` as each one starts — enough to highlight what is read. */
  onBoundary?: (textIndex: number) => void
}

/**
 * Bumped by every speak() and stop(). A callback from a cancelled utterance
 * carries the old value and is ignored — without this, Chrome's habit of firing
 * `end` for utterances it just cancelled would advance the lesson twice.
 */
let generation = 0
let keepAlive: ReturnType<typeof setInterval> | null = null

function stopKeepAlive(): void {
  if (keepAlive !== null) {
    clearInterval(keepAlive)
    keepAlive = null
  }
}

function startKeepAlive(s: SpeechSynthesis): void {
  stopKeepAlive()
  if (typeof setInterval !== 'function') return
  keepAlive = setInterval(() => {
    if (!state.speaking || state.paused) return
    try {
      // Nudging a queue that has not actually paused is a documented no-op.
      s.pause()
      s.resume()
    } catch {
      /* engine went away mid-lesson — the next end/stop tidies up */
    }
  }, 10_000)
}

/**
 * Queue `texts` and speak them in order.
 *
 * Cancels whatever was already speaking first: every caller in the app means
 * "say this now instead", never "say this afterwards".
 */
export function speak(texts: string[], opts: SpeakOptions = {}): void {
  const s = engine()
  if (!s || !isSupported()) {
    // Unsupported browsers must still complete the caller's flow, or listen
    // mode would silently freeze the lesson on a page that can never advance.
    opts.onDone?.()
    return
  }

  const items = texts
    .map((t, textIndex) => chunkForSpeech(t).map((chunk) => ({ chunk, textIndex })))
    .flat()

  generation += 1
  const mine = generation

  try {
    s.cancel()
  } catch {
    /* nothing was speaking */
  }

  if (items.length === 0) {
    setState({ speaking: false, paused: false })
    opts.onDone?.()
    return
  }

  const voice = currentVoice()
  let lastTextIndex = -1

  const speakAt = (i: number): void => {
    if (mine !== generation) return
    if (i >= items.length) {
      setState({ speaking: false, paused: false })
      stopKeepAlive()
      opts.onDone?.()
      return
    }
    const { chunk, textIndex } = items[i]
    if (textIndex !== lastTextIndex) {
      lastTextIndex = textIndex
      opts.onBoundary?.(textIndex)
    }

    let utterance: SpeechSynthesisUtterance
    try {
      utterance = new window.SpeechSynthesisUtterance(chunk)
    } catch {
      setState({ speaking: false, paused: false })
      stopKeepAlive()
      opts.onDone?.()
      return
    }

    if (voice) utterance.voice = voice
    if (opts.rate !== undefined) utterance.rate = opts.rate
    // `onerror` is treated exactly like `onend`: a chunk that failed to render
    // must not strand a hands-free listener on a page that never turns.
    utterance.onend = () => speakAt(i + 1)
    utterance.onerror = () => speakAt(i + 1)

    try {
      s.speak(utterance)
    } catch {
      speakAt(i + 1)
    }
  }

  setState({ speaking: true, paused: false })
  startKeepAlive(s)
  speakAt(0)
}

/** Silence now, and drop the rest of the queue. `onDone` will not fire. */
export function stop(): void {
  generation += 1
  stopKeepAlive()
  setState({ speaking: false, paused: false })
  const s = engine()
  if (!s) return
  try {
    s.cancel()
  } catch {
    /* already gone */
  }
}

export function pause(): void {
  const s = engine()
  if (!s || !state.speaking || state.paused) return
  try {
    s.pause()
    setState({ speaking: true, paused: true })
  } catch {
    /* engines that cannot pause simply keep going */
  }
}

export function resume(): void {
  const s = engine()
  if (!s || !state.paused) return
  try {
    s.resume()
    setState({ speaking: true, paused: false })
  } catch {
    /* ignore */
  }
}
