import type { GameEntry } from '../types'
import { formatDate } from './utils'

function escapeCsv(value: string | number) {
  const text = String(value)
  if (!/[",\n;]/.test(text)) return text
  return `"${text.replaceAll('"', '""')}"`
}

export function exportEntriesAsCsv(entries: GameEntry[]) {
  const header = ['Spiel', 'Runden', 'Datum', 'Gespielt mit', 'Gewonnen', 'Notiz']
  const rows = entries.map((entry) => [
    entry.spielName,
    entry.anzahlRunden,
    formatDate(entry.datum),
    entry.mitspieler.join(', '),
    entry.gewonnen,
    entry.notiz ?? '',
  ])

  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsv).join(';'))
    .join('\n')

  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `spiele-export-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
