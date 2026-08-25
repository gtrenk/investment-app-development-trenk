// ─── Minimal markdown renderer ───────────────────────────────────────────────
// Lesson content uses a deliberately small subset: paragraphs, bullet and
// numbered lists, pipe tables, and inline **bold** / *italic* / `code`.
// Hand-rolling it keeps the dependency list at six packages.

import type { ReactNode } from 'react'

const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g

/** Split a line into bold/italic/code spans and plain text. */
export function renderInline(text: string): ReactNode[] {
  return text
    .split(INLINE)
    .filter((t) => t !== '')
    .map((tok, i) => {
      if (tok.startsWith('**') && tok.endsWith('**'))
        return (
          <strong key={i} className="font-semibold text-white">
            {tok.slice(2, -2)}
          </strong>
        )
      if (tok.startsWith('`') && tok.endsWith('`'))
        return (
          <code
            key={i}
            className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[0.85em] text-emerald-300"
          >
            {tok.slice(1, -1)}
          </code>
        )
      if (tok.startsWith('*') && tok.endsWith('*'))
        return (
          <em key={i} className="italic text-slate-300">
            {tok.slice(1, -1)}
          </em>
        )
      return <span key={i}>{tok}</span>
    })
}

const BULLET = /^[-*]\s+/
const ORDERED = /^\d+\.\s+/

function isTableRow(line: string): boolean {
  return line.trim().startsWith('|')
}

function isTableDivider(line: string): boolean {
  return /^\|[\s:|-]+\|?$/.test(line.trim()) && line.includes('-')
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

function Table({ lines }: { lines: string[] }) {
  const rows = lines.filter((l) => !isTableDivider(l)).map(splitRow)
  const [head, ...body] = rows
  return (
    <div className="-mx-1 overflow-x-auto momentum">
      <table className="w-full min-w-full border-collapse text-left text-[13px]">
        <thead>
          <tr>
            {head.map((c, i) => (
              <th
                key={i}
                className="border-b border-slate-700 px-2 py-1.5 font-semibold text-slate-300"
              >
                {renderInline(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r}>
              {row.map((c, i) => (
                <td key={i} className="border-b border-slate-800/70 px-2 py-1.5 text-slate-300">
                  {renderInline(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Render one markdown "paragraph block" (already split on blank lines). */
function Block({ raw }: { raw: string }) {
  const lines = raw.split('\n').filter((l) => l.trim() !== '')
  if (lines.length === 0) return null

  if (lines.every(isTableRow)) return <Table lines={lines} />

  if (lines.every((l) => BULLET.test(l.trim()))) {
    return (
      <ul className="ml-1 space-y-1.5">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            <span>{renderInline(l.trim().replace(BULLET, ''))}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (lines.every((l) => ORDERED.test(l.trim()))) {
    return (
      <ol className="ml-1 space-y-1.5">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-px shrink-0 text-sm font-semibold tabular-nums text-emerald-400">
              {i + 1}.
            </span>
            <span>{renderInline(l.trim().replace(ORDERED, ''))}</span>
          </li>
        ))}
      </ol>
    )
  }

  if (lines[0].startsWith('#')) {
    const level = lines[0].match(/^#+/)?.[0].length ?? 1
    const text = lines[0].replace(/^#+\s*/, '')
    const rest = lines.slice(1).join(' ')
    return (
      <div>
        <p className={level <= 2 ? 'text-lg font-bold text-white' : 'text-base font-semibold text-white'}>
          {renderInline(text)}
        </p>
        {rest && <p className="mt-1">{renderInline(rest)}</p>}
      </div>
    )
  }

  return (
    <p>
      {lines.map((l, i) => (
        <span key={i}>
          {i > 0 && ' '}
          {renderInline(l)}
        </span>
      ))}
    </p>
  )
}

export function Markdown({ md, className = '' }: { md: string; className?: string }) {
  const blocks = md.trim().split(/\n\s*\n/)
  return (
    <div className={`space-y-3 leading-relaxed text-slate-200 ${className}`}>
      {blocks.map((b, i) => (
        <Block key={i} raw={b} />
      ))}
    </div>
  )
}
