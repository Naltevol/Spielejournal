import type { GameEntry, GameEntryDraft } from '../types'
import { normalizeGameName } from './gameAliases'
import { normalizePlayerName, normalizePlayers } from './playerAliases'

export { normalizePlayerName, normalizePlayers }

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
