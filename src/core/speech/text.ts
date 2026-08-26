// ─── Speech-ready text ───────────────────────────────────────────────────────
// Turns authored lesson markdown into something a text-to-speech voice reads
// like a person would. Pure and DOM-free, like everything else in core/ — the
// browser half lives in src/ui/speech/tts.ts.
//
// Two jobs, in this order:
//
//   1. STRUCTURE. Markdown is a *visual* format: a bullet is a pause, a table
//      row is a sentence, a heading is a lead-in. Speech has none of those
//      affordances, so each of them is rewritten as punctuation instead.
//   2. NOTATION. Finance prose is dense with glyphs that a speech engine either
//      skips ("≈"), spells out one character at a time ("P/E" → "P slash E"),
//      or reads as the wrong thing ("$36.46" → "dollar thirty six point four
//      six"). Every one of those is a table-driven rewrite below, so adding a
//      case is one row plus one test row and never a new code path.

// ── The rule table ───────────────────────────────────────────────────────────

type SpeechReplacer = (substring: string, ...groups: (string | undefined)[]) => string

export interface SpeechRule {
  /** Why the rule exists. Doubles as the label in the test table. */
  name: string
  match: RegExp
  replace: string | SpeechReplacer
}

/** Magnitude suffixes as they appear glued to a figure: `$200M`, `$9.0M`. */
const MAGNITUDE: Record<string, string> = {
  k: 'thousand',
  m: 'million',
  b: 'billion',
  t: 'trillion',
}

/**
 * `$1,234.56` → `1,234 dollars and 56 cents`.
 *
 * Two decimals are cents (and a round `.00` is simply dropped — "thirty dollars
 * and zero cents" is how a robot talks). Anything else is a plain decimal
 * figure, because `$2.5B` means two and a half billion, not two dollars fifty.
 */
const speakMoney: SpeechReplacer = (_m, rawNum, dec, suffix) => {
  const num = rawNum ?? ''
  if (suffix) {
    const figure = dec ? `${num}.${dec}` : num
    return ` ${figure} ${MAGNITUDE[suffix.toLowerCase()]} dollars `
  }
  if (dec === undefined) return ` ${num} ${num === '1' ? 'dollar' : 'dollars'} `
  if (dec.length === 2) {
    const cents = Number(dec)
    if (cents === 0) return ` ${num} ${num === '1' ? 'dollar' : 'dollars'} `
    return ` ${num} dollars and ${cents} ${cents === 1 ? 'cent' : 'cents'} `
  }
  return ` ${num}.${dec} dollars `
}

/**
 * Applied in order — several rules feed the next one, so the sequence is part
 * of the contract:
 *
 *   • cloze blanks before italics, or `____` loses two underscores to `_x_`;
 *   • SEC form numbers before number ranges, or `10-K` becomes "10 to K";
 *   • numeric en-dash ranges before the general dash rule, which turns every
 *     surviving dash into a comma-length pause.
 */
export const SPEECH_RULES: readonly SpeechRule[] = [
  // ── Markdown escapes, before anything reads the character they hid ──
  { name: 'escaped punctuation', match: /\\([|*_`[\]()~^$#-])/g, replace: '$1' },

  // ── Fill-in-the-blank cards ──
  { name: 'cloze blank', match: /_{3,}/g, replace: ' blank ' },

  // ── Inline markdown emphasis ──
  { name: 'code span', match: /`([^`]*)`/g, replace: '$1' },
  { name: 'bold', match: /\*\*([^*]+)\*\*/g, replace: '$1' },
  { name: 'italic star', match: /\*([^*\n]+)\*/g, replace: '$1' },
  {
    name: 'italic underscore',
    match: /(^|[\s(])_([^_\n]+)_(?=$|[\s).,;:!?])/g,
    replace: '$1$2',
  },
  { name: 'stray emphasis marks', match: /[*`]/g, replace: '' },

  // ── SEC filings: "ten K", never "ten dash K" or "ten to K" ──
  { name: 'form 10-K', match: /\b10-K\b/g, replace: 'ten K' },
  { name: 'form 10-Q', match: /\b10-Q\b/g, replace: 'ten Q' },
  { name: 'form 8-K', match: /\b8-K\b/g, replace: 'eight K' },
  { name: 'form S-1', match: /\bS-1\b/g, replace: 'S one' },
  { name: 'form K-1', match: /\bK-1\b/g, replace: 'K one' },

  // ── Money ──
  {
    name: 'currency amount',
    match: /\$\s?(\d[\d,]*)(?:\.(\d+))?([KMBTkmbt])?(?![A-Za-z0-9])/g,
    replace: speakMoney,
  },
  { name: 'bare dollar sign', match: /\$/g, replace: ' dollars ' },

  // ── Percent ──
  { name: 'percent', match: /\s*%/g, replace: ' percent' },

  // ── Math and comparison glyphs ──
  { name: 'multiplication / multiples', match: /×/g, replace: ' times ' },
  { name: 'x as a multiple', match: /(\d)\s*x\b/g, replace: '$1 times' },
  { name: 'division', match: /÷/g, replace: ' divided by ' },
  { name: 'approximately', match: /≈/g, replace: ' about ' },
  { name: 'plus or minus', match: /±/g, replace: ' plus or minus ' },
  { name: 'at least', match: /≥/g, replace: ' at least ' },
  { name: 'at most', match: /≤/g, replace: ' at most ' },
  { name: 'not equal', match: /≠/g, replace: ' not equal to ' },
  { name: 'unicode minus', match: /−/g, replace: ' minus ' },
  { name: 'arrow', match: /[→⟶⇒]/g, replace: ' to ' },
  { name: 'ascii at least', match: />=/g, replace: ' at least ' },
  { name: 'ascii at most', match: /<=/g, replace: ' at most ' },
  { name: 'greater than', match: /(^|[\s(])>\s*/g, replace: '$1more than ' },
  { name: 'less than', match: /(^|[\s(])<\s*/g, replace: '$1less than ' },
  { name: 'approximately (tilde)', match: /~\s*/g, replace: 'about ' },
  { name: 'exponent', match: /\^/g, replace: ' to the power of ' },
  { name: 'squared', match: /²/g, replace: ' squared ' },
  { name: 'cubed', match: /³/g, replace: ' cubed ' },
  { name: 'equals', match: /=/g, replace: ' equals ' },
  { name: 'plus', match: /(\s)\+(\s)/g, replace: '$1plus$2' },
  { name: 'divided by', match: /(\d)\s*\/\s*([A-Za-z\d])/g, replace: '$1 divided by $2' },
  {
    name: 'absolute value bars',
    match: /\|([^|\n]{1,60})\|/g,
    replace: ' the absolute value of $1 ',
  },

  // ── Greek used by the finance chapters ──
  { name: 'beta', match: /β/g, replace: ' beta ' },
  { name: 'alpha', match: /α/g, replace: ' alpha ' },
  { name: 'sigma', match: /[σΣ]/g, replace: ' sigma ' },
  { name: 'delta', match: /[Δδ]/g, replace: ' delta ' },
  { name: 'rho', match: /ρ/g, replace: ' rho ' },
  { name: 'mu', match: /μ/g, replace: ' mu ' },

  // ── Ratio acronyms: "P slash E" is unlistenable ──
  {
    name: 'slashed acronym',
    match: /\b([A-Z]{1,5})\/([A-Z]{1,7})\b/g,
    replace: '$1 $2',
  },
  /**
   * Every other slash, the same way. `debt/EBITDA` and `quality/profitability`
   * want different words ("to", "or"), and guessing wrong is worse than the
   * short pause a space gives — which is what the P/E rule above already does.
   */
  { name: 'remaining slash', match: /(\w)\s*\/\s*(\w)/g, replace: '$1 $2' },

  // ── Ranges, then every remaining dash becomes a pause ──
  { name: 'en-dash range', match: /(\d)\s*–\s*(\d)/g, replace: '$1 to $2' },
  { name: 'hyphen range', match: /(\d)\s*-\s*(\d)/g, replace: '$1 to $2' },
  { name: 'dash as pause', match: /\s*[—–]\s*/g, replace: ', ' },

  // ── Latin abbreviations ──
  { name: 'e.g.', match: /\be\.g\.,?\s*/gi, replace: 'for example, ' },
  { name: 'i.e.', match: /\bi\.e\.,?\s*/gi, replace: 'that is, ' },
  { name: 'etc.', match: /\betc\./gi, replace: 'et cetera' },
  { name: 'vs.', match: /\bvs\.?(?=\s)/gi, replace: 'versus' },

  // ── Symbols that would otherwise be skipped or spelled ──
  { name: 'ampersand', match: /&/g, replace: ' and ' },
  { name: 'at sign', match: /(\s)@(\s)/g, replace: '$1at$2' },
  { name: 'leftover hashes', match: /#/g, replace: '' },
  { name: 'middot separator', match: /\s*·\s*/g, replace: ', ' },
  { name: 'square brackets', match: /[[\]]/g, replace: ' ' },
  { name: 'stray pipe', match: /\|/g, replace: ' ' },
]

function applyRule(text: string, rule: SpeechRule): string {
  const replace = rule.replace
  return typeof replace === 'string'
    ? text.replace(rule.match, replace)
    : text.replace(rule.match, replace)
}

/** Every rule, in table order. Exported so the tests can drive it directly. */
export function applyNotationRules(text: string): string {
  return SPEECH_RULES.reduce(applyRule, text)
}

// ── Structure ────────────────────────────────────────────────────────────────

const BULLET = /^[-*+]\s+/
const ORDERED = /^\d+[.)]\s+/
const HEADING = /^#{1,6}\s*/
const BLOCKQUOTE = /^>\s?/

function isTableRow(line: string): boolean {
  return line.startsWith('|')
}

function isTableDivider(line: string): boolean {
  return /^\|[\s:|-]+\|?$/.test(line) && line.includes('-')
}

/**
 * A cell may legitimately contain a pipe, escaped as `\|` — the ATR lesson
 * writes absolute-value bars that way. Park those on a character markdown can
 * never contain, split, then put them back, so the row keeps its columns.
 */
const ESCAPED_PIPE = '\u0000'

function tableCells(line: string): string {
  return line
    .replace(/\\\|/g, ESCAPED_PIPE)
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.split(ESCAPED_PIPE).join('|').trim())
    // A lone dash is a spreadsheet's "not applicable". Read as a pause it adds
    // nothing; read as a word it is wrong. Drop it.
    .filter((c) => c !== '' && !/^[—–-]+$/.test(c))
    .join(', ')
}

/**
 * One markdown document → the list of spoken sentences it contains.
 *
 * A "sentence" here is whatever should be followed by a full stop's worth of
 * silence: a paragraph, one bullet, one table row, a heading. Soft-wrapped
 * lines inside a paragraph are *not* sentences — they are joined with a space,
 * exactly as the on-screen renderer joins them.
 */
function chunksFrom(md: string): string[] {
  const chunks: string[] = []

  for (const para of md.trim().split(/\n\s*\n/)) {
    const lines = para
      .split('\n')
      .map((l) => l.trim().replace(BLOCKQUOTE, ''))
      .filter((l) => l !== '')
    if (lines.length === 0) continue

    if (lines.every(isTableRow)) {
      for (const line of lines) {
        if (isTableDivider(line)) continue
        const cells = tableCells(line)
        if (cells) chunks.push(cells)
      }
      continue
    }

    if (lines.every((l) => BULLET.test(l))) {
      for (const l of lines) chunks.push(l.replace(BULLET, ''))
      continue
    }

    if (lines.every((l) => ORDERED.test(l))) {
      for (const l of lines) chunks.push(l.replace(ORDERED, ''))
      continue
    }

    if (HEADING.test(lines[0])) {
      chunks.push(lines[0].replace(HEADING, ''))
      if (lines.length > 1) chunks.push(lines.slice(1).join(' '))
      continue
    }

    chunks.push(lines.join(' '))
  }

  return chunks
}

/**
 * End every chunk with a stop, so the voice takes a breath between them.
 *
 * A stop that already closed a bracket or a quote counts: a parenthetical
 * aside ending `…unit.)` must not pick up a second full stop outside it.
 */
function asSentence(chunk: string): string {
  // A trailing comma is always the debris of something that was rewritten away
  // (an em dash, an empty table cell). Never ", ." at the end of a breath.
  const text = chunk.trim().replace(/[,;\s]+$/, '')
  if (text === '') return ''
  return /[.!?:][)\]"'\u2019\u201d]*$/.test(text) ? text : `${text}.`
}

/**
 * The rewrites above insert padding spaces freely (` percent `, ` to `), and
 * dashes collapse into commas that can land next to punctuation that is already
 * there. Rather than make thirty rules each tidy up after themselves, they are
 * allowed to be sloppy and this runs once at the end.
 */
function tidy(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/,\s*([,.;:])/g, '$1')
    .replace(/\.\s*,/g, '.')
    .replace(/\.\s*\./g, '.')
    .replace(/^[\s,;:.]+/, '')
    .trim()
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Markdown in, one speakable paragraph out.
 *
 * Returns `''` for anything with no words in it, which callers treat as
 * "nothing to say" rather than queueing a silent utterance.
 */
export function speakableFromMarkdown(md: string): string {
  if (!md) return ''
  const spoken = chunksFrom(md)
    .map((chunk) => asSentence(tidy(applyNotationRules(chunk))))
    .filter((s) => s !== '')
    .join(' ')
  return tidy(spoken)
}

/** `0 → 'A'`, `3 → 'D'`. */
export function optionLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

export interface SpeakableQuiz {
  question: string
  /** Already prefixed `Option A:` … `Option D:`, ready to queue as-is. */
  choices: string[]
}

/**
 * A quiz item as it is heard.
 *
 * The letters are spoken because the answer is given by tapping a lettered
 * button: without them a listener has four sentences and no way to map the one
 * they liked back onto the screen.
 */
export function speakableQuiz(item: {
  prompt: string
  choices: readonly string[]
}): SpeakableQuiz {
  return {
    question: speakableFromMarkdown(item.prompt),
    choices: item.choices.map(
      (c, i) => `Option ${optionLetter(i)}: ${speakableFromMarkdown(c)}`,
    ),
  }
}

/** A flashcard face. Cloze blanks are already spoken as "blank" by the rules. */
export function speakableCard(face: string): string {
  return speakableFromMarkdown(face)
}
