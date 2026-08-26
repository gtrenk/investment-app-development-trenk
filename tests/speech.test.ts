// ─── Speakable text ──────────────────────────────────────────────────────────
// The transformer in @core/speech/text is where read-aloud quality actually
// lives: everything downstream is plumbing, but a rule missing here is a
// listener hearing "dollar thirty six point four six" in a moving car.
//
// Three layers of coverage:
//   1. a table over every notation rule, one row per tricky case;
//   2. structural tests (bullets, tables, headings, soft wrap);
//   3. a sweep over the authored curriculum asserting nothing leaks through.

import { describe, expect, it } from 'vitest'
import {
  SPEECH_RULES,
  optionLetter,
  speakableCard,
  speakableFromMarkdown,
  speakableQuiz,
} from '@core/speech/text'
import { READ_ALOUD_RATES, defaultSettings, sanitizeSettings } from '@core/settings'
import { MAX_CHUNK_CHARS, chunkForSpeech, pickVoice } from '@ui/speech/tts'
import { ALL_LESSONS } from '@content/units'

// ── Notation ─────────────────────────────────────────────────────────────────

interface Case {
  name: string
  md: string
  spoken: string
}

const NOTATION: Case[] = [
  // Money — the format finance content is densest in.
  { name: 'dollars and cents', md: 'It closed at $1,234.56 today.', spoken: 'It closed at 1,234 dollars and 56 cents today.' },
  { name: 'round dollars drop the cents', md: 'Pay $30.00 a share.', spoken: 'Pay 30 dollars a share.' },
  { name: 'one cent is singular', md: 'A spread of $0.01 matters.', spoken: 'A spread of 0 dollars and 1 cent matters.' },
  { name: 'whole dollars', md: 'Buy at $40.', spoken: 'Buy at 40 dollars.' },
  { name: 'one dollar is singular', md: 'It costs $1 to trade.', spoken: 'It costs 1 dollar to trade.' },
  { name: 'thousands separator survives', md: 'Market cap $40,000,000 here.', spoken: 'Market cap 40,000,000 dollars here.' },
  { name: 'millions suffix', md: 'Revenue of $200M last year.', spoken: 'Revenue of 200 million dollars last year.' },
  { name: 'decimal millions suffix', md: 'Free cash flow $9.0M then.', spoken: 'Free cash flow 9.0 million dollars then.' },
  { name: 'billions suffix', md: 'A $2.5B acquisition.', spoken: 'A 2.5 billion dollars acquisition.' },

  // Percent.
  { name: 'percent sign', md: 'It fell 8% overnight.', spoken: 'It fell 8 percent overnight.' },
  { name: 'decimal percent', md: 'Yield of 3.0% here.', spoken: 'Yield of 3.0 percent here.' },

  // Math and comparison glyphs.
  { name: 'multiplication sign', md: '1,000 × $40 in total.', spoken: '1,000 times 40 dollars in total.' },
  { name: 'ratio as a multiple', md: 'It trades at 2.5× book.', spoken: 'It trades at 2.5 times book.' },
  { name: 'lowercase x multiple', md: 'It trades at 14.0x earnings.', spoken: 'It trades at 14.0 times earnings.' },
  { name: 'approximately', md: 'That is ≈ 9 years away.', spoken: 'That is about 9 years away.' },
  { name: 'tilde approximately', md: 'Recovery took ~7 years.', spoken: 'Recovery took about 7 years.' },
  { name: 'unicode minus', md: 'A −49% drawdown followed.', spoken: 'A minus 49 percent drawdown followed.' },
  { name: 'plus or minus', md: 'Implied move of ±4.5% here.', spoken: 'Implied move of plus or minus 4.5 percent here.' },
  { name: 'at least', md: 'Hold ≥ 10 names always.', spoken: 'Hold at least 10 names always.' },
  { name: 'at most', md: 'Risk ≤ 2% per trade.', spoken: 'Risk at most 2 percent per trade.' },
  { name: 'arrow', md: 'Cash → shares → dividends.', spoken: 'Cash to shares to dividends.' },
  { name: 'division sign', md: 'Growth ÷ ROIC gives it.', spoken: 'Growth divided by ROIC gives it.' },
  { name: 'slash between numbers', md: 'That is 10 / 1,000,000 exactly.', spoken: 'That is 10 divided by 1,000,000 exactly.' },
  { name: 'greater than after a bracket', md: 'Mega caps (>$200B) lead.', spoken: 'Mega caps (more than 200 billion dollars) lead.' },
  { name: 'exponent', md: 'CAGR = (1 + r)^n − 1.', spoken: 'CAGR equals (1 plus r) to the power of n minus 1.' },
  { name: 'slash before a variable', md: 'That is 1/n of the risk.', spoken: 'That is 1 divided by n of the risk.' },
  { name: 'lowercase ratio shorthand', md: 'Watch debt/EBITDA closely.', spoken: 'Watch debt EBITDA closely.' },
  { name: 'greek beta', md: 'Cost of equity uses β here.', spoken: 'Cost of equity uses beta here.' },

  // Finance shorthand.
  { name: 'P/E is not "P slash E"', md: 'A P/E of 18 is fine.', spoken: 'A P E of 18 is fine.' },
  { name: 'multi-letter slashed acronym', md: 'Compare EV/EBITDA across peers.', spoken: 'Compare EV EBITDA across peers.' },
  { name: 'form 10-K', md: 'Read the 10-K first.', spoken: 'Read the ten K first.' },
  { name: 'form 10-Q', md: 'Then the 10-Q filing.', spoken: 'Then the ten Q filing.' },
  { name: 'form 8-K', md: 'An 8-K disclosed it.', spoken: 'An eight K disclosed it.' },
  { name: 'ampersand', md: 'The S&P 500 index rose.', spoken: 'The S and P 500 index rose.' },

  // Ranges and dashes.
  { name: 'en-dash numeric range', md: 'Hold 15–25 names total.', spoken: 'Hold 15 to 25 names total.' },
  { name: 'hyphen year range', md: 'The 2000-2002 bust hurt.', spoken: 'The 2000 to 2002 bust hurt.' },
  { name: 'em dash becomes a pause', md: 'Stocks are residual claims — that is the risk.', spoken: 'Stocks are residual claims, that is the risk.' },
  { name: 'hyphenated words are left alone', md: 'A risk-free rate applies.', spoken: 'A risk-free rate applies.' },

  // Latin abbreviations.
  { name: 'e.g.', md: 'Defensives, e.g. utilities, lag.', spoken: 'Defensives, for example, utilities, lag.' },
  { name: 'i.e.', md: 'The float, i.e. tradable shares, is small.', spoken: 'The float, that is, tradable shares, is small.' },

  // Cloze blanks.
  { name: 'cloze blank', md: 'Shareholders are paid ____ in a bankruptcy.', spoken: 'Shareholders are paid blank in a bankruptcy.' },
  { name: 'longer cloze blank', md: 'The ratio is ________ by definition.', spoken: 'The ratio is blank by definition.' },
]

describe('notation reads the way a person would say it', () => {
  for (const c of NOTATION) {
    it(c.name, () => {
      expect(speakableFromMarkdown(c.md)).toBe(c.spoken)
    })
  }
})

// ── Emphasis and structure ───────────────────────────────────────────────────

const STRUCTURE: Case[] = [
  { name: 'bold markers vanish', md: 'A **stock** is ownership.', spoken: 'A stock is ownership.' },
  { name: 'italic markers vanish', md: 'These are *residual* claims.', spoken: 'These are residual claims.' },
  { name: 'underscore italics vanish', md: 'These are _residual_ claims.', spoken: 'These are residual claims.' },
  { name: 'code spans vanish', md: 'Call `getQuote()` first.', spoken: 'Call getQuote() first.' },
  { name: 'headings become a sentence', md: '## Why it matters', spoken: 'Why it matters.' },
  { name: 'blockquotes lose their marker', md: '> Price is what you pay.', spoken: 'Price is what you pay.' },
  {
    name: 'soft-wrapped lines join into one sentence',
    md: 'A stock is a slice\nof ownership in a company.',
    spoken: 'A stock is a slice of ownership in a company.',
  },
  {
    name: 'bullets become separate sentences',
    md: '- A claim on profits\n- A vote',
    spoken: 'A claim on profits. A vote.',
  },
  {
    name: 'numbered lists become separate sentences',
    md: '1. Buy low\n2. Sell high',
    spoken: 'Buy low. Sell high.',
  },
  {
    name: 'bullets that already end in punctuation are not double-stopped',
    md: '- A claim on profits.\n- A vote.',
    spoken: 'A claim on profits. A vote.',
  },
  {
    name: 'paragraphs are joined with a stop between them',
    md: 'First paragraph\n\nSecond paragraph',
    spoken: 'First paragraph. Second paragraph.',
  },
  {
    name: 'tables read row by row, divider skipped',
    md: '| Episode | Decline |\n|---|---|\n| Dot-com | −49% |\n| COVID | −34% |',
    spoken: 'Episode, Decline. Dot-com, minus 49 percent. COVID, minus 34 percent.',
  },
  {
    name: 'escaped pipes stay inside their cell',
    md: '| Formula | Value |\n|---|---|\n| \\|high − low\\| | $1.20 |',
    spoken: 'Formula, Value. the absolute value of high minus low, 1 dollars and 20 cents.',
  },
]

describe('markdown structure becomes punctuation', () => {
  for (const c of STRUCTURE) {
    it(c.name, () => {
      expect(speakableFromMarkdown(c.md)).toBe(c.spoken)
    })
  }
})

describe('nothing to say', () => {
  it.each([
    ['', ''],
    ['   ', ''],
    ['\n\n', ''],
    ['**', ''],
  ])('%j → %j', (md, spoken) => {
    expect(speakableFromMarkdown(md)).toBe(spoken)
  })
})

describe('tidying', () => {
  it('collapses runs of whitespace', () => {
    expect(speakableFromMarkdown('One    two\t\tthree')).toBe('One two three.')
  })

  it('never leaves a space before punctuation', () => {
    expect(speakableFromMarkdown('It rose 8% , then fell.')).toBe('It rose 8 percent, then fell.')
  })

  it('never doubles a stop where a dash met one', () => {
    expect(speakableFromMarkdown('Own it — always.')).toBe('Own it, always.')
  })

  it('always ends on a stop, so the voice does not trail off', () => {
    expect(speakableFromMarkdown('No punctuation here')).toMatch(/\.$/)
  })
})

// ── Quiz and cards ───────────────────────────────────────────────────────────

describe('speakableQuiz', () => {
  const item = {
    prompt: 'A company earns **$4,000,000**. What is your 0.001% slice?',
    choices: ['$40', '$400', '$4,000', 'None of these'],
  }

  it('strips markdown from the question', () => {
    expect(speakableQuiz(item).question).toBe(
      'A company earns 4,000,000 dollars. What is your 0.001 percent slice?',
    )
  })

  it('letters every choice, so a listener can map it to a button', () => {
    expect(speakableQuiz(item).choices).toEqual([
      'Option A: 40 dollars.',
      'Option B: 400 dollars.',
      'Option C: 4,000 dollars.',
      'Option D: None of these.',
    ])
  })

  it('letters run A through D', () => {
    expect([0, 1, 2, 3].map(optionLetter)).toEqual(['A', 'B', 'C', 'D'])
  })
})

describe('speakableCard', () => {
  it('speaks a cloze blank as "blank"', () => {
    expect(speakableCard('Free cash flow = operating cash flow − ____.')).toBe(
      'Free cash flow equals operating cash flow minus blank.',
    )
  })

  it('reads a card back the same way as a lesson block', () => {
    const md = 'Doji: open ≈ close, tiny body, indecision.'
    expect(speakableCard(md)).toBe(speakableFromMarkdown(md))
  })
})

// ── The whole curriculum ─────────────────────────────────────────────────────

/**
 * The real regression guard. Rules are written against the content that exists,
 * so the useful question is not "does rule 12 fire" but "can any authored
 * string still reach a voice with a glyph in it that would be mispronounced,
 * spelled out, or silently skipped".
 */
const MUST_NOT_SURVIVE = [
  '*', '`', '#', '|', '$', '%', '×', '→', '≈', '−', '±', '≥', '≤', '÷', '—', '–',
  '~', '^', '²', '³', 'β', 'σ', 'ρ', '[', ']', '\\',
]

describe('the authored curriculum is fully speakable', () => {
  const spoken: Array<[string, string]> = []
  for (const lesson of ALL_LESSONS) {
    lesson.blocks.forEach((b, i) => spoken.push([`${lesson.id} block ${i}`, speakableFromMarkdown(b.md)]))
    for (const q of lesson.quiz) {
      const s = speakableQuiz(q)
      spoken.push([`${q.id} prompt`, s.question])
      s.choices.forEach((c, i) => spoken.push([`${q.id} choice ${i}`, c]))
      spoken.push([`${q.id} explain`, speakableFromMarkdown(q.explain)])
    }
    for (const c of lesson.cardSeeds) {
      spoken.push([`${c.id} front`, speakableCard(c.front)])
      spoken.push([`${c.id} back`, speakableCard(c.back)])
    }
  }

  it('covers every lesson', () => {
    expect(ALL_LESSONS.length).toBeGreaterThan(0)
    expect(spoken.length).toBeGreaterThan(ALL_LESSONS.length)
  })

  it('leaves no unspeakable glyph anywhere', () => {
    const offenders = spoken
      .filter(([, text]) => MUST_NOT_SURVIVE.some((ch) => text.includes(ch)))
      .map(([where, text]) => `${where}: ${text.slice(0, 120)}`)
    expect(offenders).toEqual([])
  })

  it('never produces an empty string for authored content', () => {
    expect(spoken.filter(([, text]) => text.trim() === '').map(([where]) => where)).toEqual([])
  })

  it('never leaves a doubled stop or a floating comma', () => {
    const offenders = spoken
      .filter(([, text]) => /\.\s*\.|\s,|,\s*\.|^\s*[,.]/.test(text))
      .map(([where, text]) => `${where}: ${text.slice(0, 120)}`)
    expect(offenders).toEqual([])
  })
})

// ── The rule table itself ────────────────────────────────────────────────────

describe('the rule table', () => {
  it('names every rule uniquely, so a failure points at one row', () => {
    const names = SPEECH_RULES.map((r) => r.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('matches globally — a rule that fired once would leave the rest of a line raw', () => {
    expect(SPEECH_RULES.filter((r) => !r.match.global).map((r) => r.name)).toEqual([])
  })
})

// ── Chunking for the browser engine ──────────────────────────────────────────
// Lives in src/ui/speech/tts.ts because the rest of that module touches
// `window`, but the splitter itself is pure and is the thing standing between a
// long lesson block and Chrome's fifteen-second utterance cut-off.

describe('chunkForSpeech', () => {
  it('leaves short text as one utterance', () => {
    expect(chunkForSpeech('A stock is ownership.')).toEqual(['A stock is ownership.'])
  })

  it('says nothing for empty or blank text', () => {
    expect(chunkForSpeech('')).toEqual([])
    expect(chunkForSpeech('   \n ')).toEqual([])
  })

  it('splits on sentence ends, not mid-phrase', () => {
    const text = `${'a'.repeat(120)}. ${'b'.repeat(120)}. ${'c'.repeat(60)}.`
    const chunks = chunkForSpeech(text)
    expect(chunks.length).toBeGreaterThan(1)
    for (const c of chunks) expect(c).toMatch(/[.!?;:]$/)
  })

  it('keeps every chunk under the cap', () => {
    const long = ALL_LESSONS.flatMap((l) => l.blocks).map((b) => speakableFromMarkdown(b.md))
    for (const text of long) {
      for (const chunk of chunkForSpeech(text)) {
        expect(chunk.length).toBeLessThanOrEqual(MAX_CHUNK_CHARS)
      }
    }
  })

  it('falls back to word boundaries for one very long sentence', () => {
    const runOn = Array.from({ length: 80 }, (_, i) => `word${i}`).join(' ')
    const chunks = chunkForSpeech(runOn)
    expect(chunks.length).toBeGreaterThan(1)
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(MAX_CHUNK_CHARS)
    // Nothing is dropped and nothing is invented.
    expect(chunks.join(' ')).toBe(runOn)
  })

  it('loses no words from real lesson content', () => {
    for (const lesson of ALL_LESSONS.slice(0, 20)) {
      for (const block of lesson.blocks) {
        const text = speakableFromMarkdown(block.md)
        expect(chunkForSpeech(text).join(' ').replace(/\s+/g, ' ')).toBe(text)
      }
    }
  })
})

// ── The stored preference ────────────────────────────────────────────────────

describe('read-aloud settings', () => {
  it('is off by default — this is an opt-in feature', () => {
    expect(defaultSettings()).toEqual({ readAloud: { enabled: false, rate: 1 }, pace: 1 })
  })

  it.each([undefined, null, 42, 'nonsense', {}, { readAloud: null }])(
    'degrades %j to defaults rather than throwing',
    (raw) => {
      expect(sanitizeSettings(raw)).toEqual(defaultSettings())
    },
  )

  it('keeps a stored choice', () => {
    expect(sanitizeSettings({ readAloud: { enabled: true, rate: 1.5 } })).toEqual({
      readAloud: { enabled: true, rate: 1.5 },
      // Pace is a sibling key in the same blob; a record written before it
      // existed still reads back at the default.
      pace: 1,
    })
  })

  it('rejects a rate that is not one of the four offered', () => {
    expect(sanitizeSettings({ readAloud: { enabled: true, rate: 9 } }).readAloud.rate).toBe(1)
  })

  it('treats any non-true `enabled` as off', () => {
    expect(sanitizeSettings({ readAloud: { enabled: 'yes', rate: 1 } }).readAloud.enabled).toBe(false)
  })

  it('offers rates in ascending order, 1 among them', () => {
    expect([...READ_ALOUD_RATES]).toEqual([...READ_ALOUD_RATES].sort((a, b) => a - b))
    expect(READ_ALOUD_RATES).toContain(1)
  })
})

describe('pickVoice', () => {
  const voice = (name: string, lang: string, localService: boolean): SpeechSynthesisVoice =>
    ({ name, lang, localService, default: false, voiceURI: name }) as SpeechSynthesisVoice

  const voices = [
    voice('Google UK English', 'en-GB', false),
    voice('Samantha', 'en-US', true),
    voice('Daniel', 'en-GB', true),
    voice('Amélie', 'fr-CA', true),
  ]

  it('takes the exact locale when there is one', () => {
    expect(pickVoice(voices, 'en-US')?.name).toBe('Samantha')
  })

  it('prefers a locally installed voice over a network one', () => {
    // en-GB has both; the offline one wins, because a lesson in the car may be
    // playing with no signal.
    expect(pickVoice(voices, 'en-GB')?.name).toBe('Daniel')
  })

  it('falls back to the language when the region has no voice', () => {
    expect(pickVoice(voices, 'fr-FR')?.name).toBe('Amélie')
  })

  it('falls back to English when the language is missing entirely', () => {
    expect(pickVoice(voices, 'ja-JP')?.lang).toMatch(/^en/)
  })

  it('returns null rather than guessing when the platform has no voices', () => {
    expect(pickVoice([], 'en-US')).toBeNull()
  })
})
