import { sampleEntries } from '../data/sampleEntries'
import { normalizeGameDraft, normalizePlayerName, normalizePlayers } from '../domain/dataNormalization'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { DataSourceDiagnostics, GameEntry, GameEntryDraft, GameEntryLoadResult } from '../types'

const STORAGE_KEY = 'boardgame-journal.entries.v1'
const TABLE_NAME = 'game_entries'

const GAME_ENTRY_COLUMNS = [
  'id',
  'user_id',
  'spiel_name',
  'datum',
  'anzahl_runden',
  'mitspieler',
  'gewonnen',
  'notiz',
  'created_at',
  'updated_at',
  'import_key',
].join(',')

type GameEntryRow = Record<string, unknown>

export interface GameEntryRepository {
  list(userId?: string): Promise<GameEntryLoadResult>
  create(entry: GameEntry): Promise<GameEntry>
  update(id: string, draft: GameEntryDraft): Promise<GameEntry>
  delete(id: string): Promise<void>
}

function createDiagnostics(
  source: DataSourceDiagnostics['source'],
  values: Partial<DataSourceDiagnostics> = {},
): DataSourceDiagnostics {
  return {
    isSupabaseConfigured,
    isLoginActive: isSupabaseConfigured,
    source,
    rawRowCount: null,
    lastError: null,
    firstRawRow: null,
    ...values,
  }
}

function getString(row: GameEntryRow, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
  }

  return ''
}

function getNumber(row: GameEntryRow, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }

  return 0
}

function getPlayers(row: GameEntryRow) {
  const value = row.mitspieler ?? row.players
  if (Array.isArray(value)) {
    return value.map((player) => normalizePlayerName(String(player))).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value.split(',').map((player) => normalizePlayerName(player)).filter(Boolean)
  }

  return []
}

function toRow(entry: GameEntry | GameEntryDraft) {
  const normalized = normalizeGameDraft(entry)
  const userId = 'userId' in entry ? entry.userId : undefined

  return {
    ...(userId ? { user_id: userId } : {}),
    spiel_name: normalized.spielName,
    datum: normalized.datum,
    anzahl_runden: normalized.anzahlRunden,
    mitspieler: normalized.mitspieler,
    gewonnen: normalized.gewonnen,
    notiz: normalized.notiz || null,
  }
}

function normalizeStoredEntry(entry: GameEntry): GameEntry {
  return {
    ...entry,
    anzahlRunden: Math.max(1, Number(entry.anzahlRunden) || 1),
    gewonnen: Math.max(0, Number(entry.gewonnen) || 0),
    mitspieler: normalizePlayers(entry.mitspieler),
  }
}

function fromRow(row: GameEntryRow): GameEntry {
  return normalizeStoredEntry({
    id: getString(row, 'id'),
    userId: getString(row, 'user_id') || undefined,
    spielName: getString(row, 'spiel_name', 'spielName', 'game'),
    datum: getString(row, 'datum', 'date'),
    anzahlRunden: getNumber(row, 'anzahl_runden', 'anzahlRunden', 'rounds'),
    mitspieler: getPlayers(row),
    gewonnen: getNumber(row, 'gewonnen', 'wins'),
    notiz: getString(row, 'notiz', 'note'),
  })
}

function readLocalEntries() {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEntries))
    return sampleEntries.map(normalizeStoredEntry)
  }

  try {
    return (JSON.parse(stored) as GameEntry[]).map(normalizeStoredEntry)
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEntries))
    return sampleEntries.map(normalizeStoredEntry)
  }
}

function writeLocalEntries(entries: GameEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export class LocalStorageGameEntryRepository implements GameEntryRepository {
  async list() {
    const entries = readLocalEntries()
    return {
      entries,
      diagnostics: createDiagnostics('localStorage', {
        rawRowCount: entries.length,
        firstRawRow: entries[0] ? { ...entries[0] } : null,
      }),
    }
  }

  async create(entry: GameEntry) {
    const normalizedEntry = { ...normalizeGameDraft(entry), id: entry.id }
    const entries = readLocalEntries()
    writeLocalEntries([normalizedEntry, ...entries])
    return normalizedEntry
  }

  async update(id: string, draft: GameEntryDraft) {
    const updatedEntry = { ...normalizeGameDraft(draft), id }
    const entries = readLocalEntries().map((entry) =>
      entry.id === id ? updatedEntry : entry,
    )
    writeLocalEntries(entries)
    return updatedEntry
  }

  async delete(id: string) {
    writeLocalEntries(readLocalEntries().filter((entry) => entry.id !== id))
  }
}

export class SupabaseGameEntryRepository implements GameEntryRepository {
  async list(userId?: string) {
    if (!supabase) {
      return {
        entries: [],
        diagnostics: createDiagnostics('supabase', {
          lastError: 'Supabase ist nicht konfiguriert.',
        }),
      }
    }

    if (!userId) {
      return {
        entries: [],
        diagnostics: createDiagnostics('supabase', {
          lastError: 'Bitte melde dich an, um deine Spiele zu laden.',
        }),
      }
    }

    const { data, error, count } = await supabase
      .from(TABLE_NAME)
      .select(GAME_ENTRY_COLUMNS, { count: 'exact' })
      .eq('user_id', userId)
      .order('datum', { ascending: false })
      .order('spiel_name', { ascending: true })

    if (error) {
      return {
        entries: [],
        diagnostics: createDiagnostics('supabase', {
          rawRowCount: count ?? 0,
          lastError: error.message,
        }),
      }
    }

    const rows = (data ?? []) as unknown as GameEntryRow[]

    return {
      entries: rows.map(fromRow),
      diagnostics: createDiagnostics('supabase', {
        rawRowCount: count ?? rows.length,
        firstRawRow: rows[0] ?? null,
      }),
    }
  }

  async create(entry: GameEntry) {
    if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({ ...toRow(entry), id: entry.id })
      .select(GAME_ENTRY_COLUMNS)
      .single()

    if (error) throw error

    return fromRow(data as unknown as GameEntryRow)
  }

  async update(id: string, draft: GameEntryDraft) {
    if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(toRow(draft))
      .eq('id', id)
      .select(GAME_ENTRY_COLUMNS)
      .single()

    if (error) throw error

    return fromRow(data as unknown as GameEntryRow)
  }

  async delete(id: string) {
    if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')

    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id)
    if (error) throw error
  }
}

function createRepository() {
  if (isSupabaseConfigured) return new SupabaseGameEntryRepository()
  return new LocalStorageGameEntryRepository()
}

export const gameEntryRepository = createRepository()
export { isSupabaseConfigured }
