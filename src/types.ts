export type GameEntry = {
  id: string
  spielName: string
  datum: string
  anzahlRunden: number
  mitspieler: string[]
  gewonnen: number
  notiz?: string
}

export type GameEntryDraft = Omit<GameEntry, 'id'>

export type GameFilters = {
  suche: string
  jahr: string
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
