import type { GameEntry, GameEntryDraft } from '../types'
import { normalizeGameName } from './gameAliases'

export function normalizePlayerName(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

const duplicatePlayerAliases: Record<string, string> = {
  lennart: 'Lennart S.',
  lena: 'Lena B.',
}

export function normalizePlayers(values: string[]) {
  const players: string[] = []
  const playerCounts = new Map<string, number>()

  for (const value of values) {
    const normalized = normalizePlayerName(value)
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

