import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { sampleEntries } from '../data/sampleEntries'
import type { GameEntry, GameEntryDraft } from '../types'

const STORAGE_KEY = 'boardgame-journal.entries.v1'
const TABLE_NAME = 'game_entries'

type GameEntryRow = {
  id: string
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

function toRow(entry: GameEntry | GameEntryDraft): Omit<GameEntryRow, 'id'> {
  return {
    spiel_name: entry.spielName,
    datum: entry.datum,
    anzahl_runden: entry.anzahlRunden,
    mitspieler: entry.mitspieler,
    gewonnen: entry.gewonnen,
    notiz: entry.notiz || null,
  }
}

function fromRow(row: GameEntryRow): GameEntry {
  return {
    id: row.id,
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

export class LocalStorageGameEntryRepository implements GameEntryRepository {
  async list() {
    return readLocalEntries()
  }

  async create(entry: GameEntry) {
    const entries = readLocalEntries()
    writeLocalEntries([entry, ...entries])
    return entry
  }

  async update(id: string, draft: GameEntryDraft) {
    const updatedEntry = { ...draft, id }
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
  constructor(private readonly client: SupabaseClient) {}

  async list() {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select('*')
      .order('datum', { ascending: false })
      .order('spiel_name', { ascending: true })

    if (error) throw error

    return (data ?? []).map((row) => fromRow(row as GameEntryRow))
  }

  async create(entry: GameEntry) {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .insert({ ...toRow(entry), id: entry.id })
      .select()
      .single()

    if (error) throw error

    return fromRow(data as GameEntryRow)
  }

  async update(id: string, draft: GameEntryDraft) {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .update(toRow(draft))
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return fromRow(data as GameEntryRow)
  }

  async delete(id: string) {
    const { error } = await this.client.from(TABLE_NAME).delete().eq('id', id)

    if (error) throw error
  }
}

function createRepository() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (url && anonKey) {
    return new SupabaseGameEntryRepository(createClient(url, anonKey))
  }

  return new LocalStorageGameEntryRepository()
}

export const gameEntryRepository = createRepository()
export const isSupabaseConfigured = gameEntryRepository instanceof SupabaseGameEntryRepository
