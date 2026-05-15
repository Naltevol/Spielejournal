export type GameEntry = {
  id: string
  userId?: string
  spielName: string
  datum: string
  anzahlRunden: number
  mitspieler: string[]
  gewonnen: number
  notiz?: string
}

export type GameEntryDraft = Omit<GameEntry, 'id' | 'userId'>

export type GameFilters = {
  suche: string
  jahr: string
  monat: string
  mitspieler: string
  gewinnstatus: 'alle' | 'gewonnen' | 'verloren'
}

export type AnalyticsSummary = {
  gesamtRunden: number
  unterschiedlicheSpiele: number
  haeufigstesSpiel: string
  haeufigsterMitspieler: string
  gewinnquote: number
}

export type NamedCount = {
  name: string
  value: number
}


export type DataSourceDiagnostics = {
  isSupabaseConfigured: boolean
  isLoginActive: boolean
  source: 'supabase' | 'localStorage'
  rawRowCount: number | null
  lastError: string | null
  firstRawRow: Record<string, unknown> | null
}

export type GameEntryLoadResult = {
  entries: GameEntry[]
  diagnostics: DataSourceDiagnostics
}
