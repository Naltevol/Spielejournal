import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

type CsvRow = Record<string, string>
type ImportDraft = {
  spielName: string
  datum: string
  anzahlRunden: number
  mitspieler: string[]
  gewonnen: number
  notiz?: string
}

const aliases: Record<string, string[]> = {
  'Bomb Busters': ['BombBusters', 'Bomb Busters'],
  'Flip 7': ['Flip7', 'Flip 7'],
  GAP: ['GAP', 'Gap', 'Gab'],
  'Lovecraft Letter': ['Lovecraft Letter', 'LoveCraftLetter', 'Lovekraft Letter'],
  'Sea, Salt & Paper': ['Sea, Salt und Paper', 'Sea, Salt & Paper'],
  Quoridor: ['Qouridor', 'Quoridor'],
  Wizard: ['Wizard'],
  'Siedler von Catan': ['Siedler', 'Siedler von Catan'],
  'Poesie für Neandertaler': ['Poesie', 'Poesie für Neandertaler'],
}

function aliasKey(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('de').replace(/&/g, 'und').replace(/[^a-z0-9]+/g, '')
}

const aliasMap = new Map<string, string>()
for (const [canonical, values] of Object.entries(aliases)) {
  aliasMap.set(aliasKey(canonical), canonical)
  for (const value of values) aliasMap.set(aliasKey(value), canonical)
}

function normalizeGameName(value: string) {
  const cleaned = value.trim().replace(/\s+/g, ' ')
  return aliasMap.get(aliasKey(cleaned)) ?? cleaned
}

const duplicatePlayerAliases: Record<string, string> = {
  lennart: 'Lennart S.',
  lena: 'Lena B.',
}

function normalizePlayers(values: string[]) {
  const players: string[] = []
  const playerCounts = new Map<string, number>()

  for (const value of values) {
    const normalized = value.trim().replace(/\s+/g, ' ')
    if (!normalized) continue

    const playerKey = normalized.toLocaleLowerCase('de')
    const playerCount = (playerCounts.get(playerKey) ?? 0) + 1
    playerCounts.set(playerKey, playerCount)

    if (playerCount > 1 && duplicatePlayerAliases[playerKey]) {
      players.push(duplicatePlayerAliases[playerKey])
      continue
    }

    players.push(normalized)
  }

  return players
}

function normalizeDraft(draft: ImportDraft): ImportDraft {
  const anzahlRunden = Math.max(1, Number(draft.anzahlRunden) || 1)
  const gewonnen = Math.max(0, Math.min(Number(draft.gewonnen) || 0, anzahlRunden))
  return {
    ...draft,
    spielName: normalizeGameName(draft.spielName),
    anzahlRunden,
    gewonnen,
    mitspieler: normalizePlayers(draft.mitspieler),
    notiz: draft.notiz?.trim() || '',
  }
}

function createDuplicateKey(entry: ImportDraft) {
  return [entry.spielName, entry.datum, entry.anzahlRunden, entry.mitspieler.join('|'), entry.gewonnen].join('::')
}

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return
  const content = readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]
    if (char === '"' && next === '"') {
      current += '"'
      index += 1
      continue
    }
    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (char === ';' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }
    current += char
  }
  values.push(current)
  return values.map((value) => value.trim())
}

function parseCsv(filePath: string): CsvRow[] {
  const content = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
  const lines = content.split(/\r?\n/).filter((line) => line.trim())
  const header = parseCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(header.map((key, index) => [key, values[index] ?? '']))
  })
}

function normalizeDate(value: string) {
  return value.trim().replace(/\./g, '-')
}

function rowToDraft(row: CsvRow): ImportDraft {
  return normalizeDraft({
    spielName: row.spielName || row.spiel_name,
    datum: normalizeDate(row.datum),
    anzahlRunden: Number(row.anzahlRunden || row.anzahl_runden),
    mitspieler: row.mitspieler.split(',').map((player) => player.trim()),
    gewonnen: Number(row.gewonnen),
    notiz: row.notiz,
  })
}

async function main() {
  loadEnvFile(resolve('.env.local'))
  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  const csvPath = process.argv[2] ?? 'data/import/spielejournal-2026.csv'
  if (!url || !anonKey) throw new Error('VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY fehlen.')

  const supabase = createClient(url, anonKey)

  const rows = parseCsv(csvPath).map(rowToDraft).map((draft) => ({
    spiel_name: draft.spielName,
    datum: draft.datum,
    anzahl_runden: draft.anzahlRunden,
    mitspieler: draft.mitspieler,
    gewonnen: draft.gewonnen,
    notiz: draft.notiz || null,
    import_key: createDuplicateKey(draft),
  }))

  const importKeys = rows.map((row) => row.import_key)
  const { data: existingRows, error: existingError } = await supabase
    .from('game_entries')
    .select('import_key')
    .in('import_key', importKeys)
  if (existingError) throw existingError

  const existingKeys = new Set((existingRows ?? []).map((row) => row.import_key))
  const newRows = rows.filter((row) => !existingKeys.has(row.import_key))

  if (newRows.length > 0) {
    const { error } = await supabase.from('game_entries').insert(newRows)
    if (error) throw error
  }

  console.log('Import abgeschlossen. Neue Einträge: ' + newRows.length + '. Bereits vorhandene Duplikate wurden übersprungen.')
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

