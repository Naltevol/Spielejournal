import type { GameEntry, GameEntryDraft } from '../types'
import { normalizeGameName } from './gameAliases'

export function normalizePlayerName(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export function normalizePlayers(values: string[]) {
  const players: string[] = []
  let lennartCount = 0

  for (const value of values) {
    const normalized = normalizePlayerName(value)
    if (!normalized) continue

    if (normalized.toLocaleLowerCase('de') === 'lennart') {
      lennartCount += 1
      players.push(lennartCount === 1 ? 'Lennart' : 'Lennart S.')
      continue
    }

    players.push(normalized)
  }

  return players
}

export function normalizeGameDraft(draft: GameEntryDraft): GameEntryDraft {
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

export function createDuplicateKey(entry: Pick<GameEntry, 'spielName' | 'datum' | 'anzahlRunden' | 'mitspieler' | 'gewonnen'>) {
  return [
    normalizeGameName(entry.spielName),
    entry.datum,
    entry.anzahlRunden,
    normalizePlayers(entry.mitspieler).join('|'),
    entry.gewonnen,
  ].join('::')
}

