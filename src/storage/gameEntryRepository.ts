import { sampleEntries } from '../data/sampleEntries'
import { normalizeGameDraft } from '../domain/dataNormalization'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { GameEntry, GameEntryDraft } from '../types'

const STORAGE_KEY = 'boardgame-journal.entries.v1'
const TABLE_NAME = 'game_entries'

type GameEntryRow = {
  id: string
  user_id: string | null
  spiel_name: string
  datum: string
  anzahl_runden: number
  mitspieler: string[]
  gewonnen: number
  notiz: string | null
  created_at?: string
}

export interface GameEntryRepository {
  list(): Promise<GameEntry[]>
  create(entry: GameEntry): Promise<GameEntry>
  update(id: string, draft: GameEntryDraft): Promise<GameEntry>
  delete(id: string): Promise<void>
}

function toRow(entry: GameEntry | GameEntryDraft, userId?: string) {
  const normalized = normalizeGameDraft(entry)

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

function fromRow(row: GameEntryRow): GameEntry {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    spielName: row.spiel_name,
    datum: row.datum,
    anzahlRunden: row.anzahl_runden,
    mitspieler: row.mitspieler ?? [],
    gewonnen: row.gewonnen,
    notiz: row.notiz ?? '',
  }
}

function readLocalEntries() {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEntries))
    return sampleEntries
  }

  try {
    return JSON.parse(stored) as GameEntry[]
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEntries))
    return sampleEntries
  }
}

function writeLocalEntries(entries: GameEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

async function getAuthenticatedUserId() {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')

  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('Bitte melde dich erneut an.')

  return data.user.id
}

export class LocalStorageGameEntryRepository implements GameEntryRepository {
  async list() {
    return readLocalEntries()
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
  async list() {
    if (!supabase) return []

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('datum', { ascending: false })
      .order('spiel_name', { ascending: true })

    if (error) throw error

    return (data ?? []).map((row) => fromRow(row as GameEntryRow))
  }

  async create(entry: GameEntry) {
    if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')

    const userId = await getAuthenticatedUserId()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({ ...toRow(entry, userId), id: entry.id })
      .select()
      .single()

    if (error) throw error

    return fromRow(data as GameEntryRow)
  }

  async update(id: string, draft: GameEntryDraft) {
    if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(toRow(draft))
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return fromRow(data as GameEntryRow)
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

