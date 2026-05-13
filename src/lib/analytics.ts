import type { AnalyticsSummary, GameEntry, NamedCount } from '../types'

function addToMap(map: Map<string, number>, key: string, value: number) {
  map.set(key, (map.get(key) ?? 0) + value)
}

function mapToSortedCounts(map: Map<string, number>): NamedCount[] {
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'de'))
}

export function getYears(entries: GameEntry[]) {
  return [...new Set(entries.map((entry) => entry.datum.slice(0, 4)))]
    .filter(Boolean)
    .sort((a, b) => Number(b) - Number(a))
}

export function getPlayers(entries: GameEntry[]) {
  return [...new Set(entries.flatMap((entry) => entry.mitspieler))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'de'))
}

export function filterEntries(entries: GameEntry[], year: string) {
  if (year === 'alle') return entries
  return entries.filter((entry) => entry.datum.startsWith(year))
}

export function buildCounts(entries: GameEntry[]) {
  const gameCounts = new Map<string, number>()
  const playerCounts = new Map<string, number>()

  for (const entry of entries) {
    addToMap(gameCounts, entry.spielName, entry.anzahlRunden)
    for (const player of entry.mitspieler) {
      addToMap(playerCounts, player, entry.anzahlRunden)
    }
  }

  const won = entries.reduce((sum, entry) => sum + entry.gewonnen, 0)
  const rounds = entries.reduce((sum, entry) => sum + entry.anzahlRunden, 0)

  return {
    games: mapToSortedCounts(gameCounts),
    players: mapToSortedCounts(playerCounts),
    results: [
      { name: 'Gewonnen', value: won },
      { name: 'Verloren', value: Math.max(0, rounds - won) },
    ].filter((item) => item.value > 0),
  }
}

export function summarizeEntries(entries: GameEntry[]): AnalyticsSummary {
  const counts = buildCounts(entries)
  const gesamtRunden = entries.reduce((sum, entry) => sum + entry.anzahlRunden, 0)
  const gewonnen = entries.reduce((sum, entry) => sum + entry.gewonnen, 0)

  return {
    gesamtRunden,
    unterschiedlicheSpiele: new Set(entries.map((entry) => entry.spielName)).size,
    haeufigstesSpiel: counts.games[0]?.name ?? 'Keine Daten',
    haeufigsterMitspieler: counts.players[0]?.name ?? 'Keine Daten',
    gewinnquote: gesamtRunden === 0 ? 0 : Math.round((gewonnen / gesamtRunden) * 100),
  }
}
