import type { GameEntry } from '../types'

export const sampleEntries: GameEntry[] = [
  {
    id: 'sample-monopoly-deal-2026-01-01',
    spielName: 'Monopoly Deal',
    datum: '2026-01-01',
    anzahlRunden: 3,
    mitspieler: ['Nele'],
    gewonnen: 2,
  },
  {
    id: 'sample-skull-2026-01-02',
    spielName: 'Skull',
    datum: '2026-01-02',
    anzahlRunden: 3,
    mitspieler: ['Nele', 'Lennart', 'Lukas'],
    gewonnen: 2,
  },
  {
    id: 'sample-doppelkopf-2026-01-02',
    spielName: 'Doppelkopf',
    datum: '2026-01-02',
    anzahlRunden: 5,
    mitspieler: ['Nele', 'Lennart', 'Lukas'],
    gewonnen: 4,
  },
  {
    id: 'sample-bomb-busters-2026-01-03',
    spielName: 'Bomb Busters',
    datum: '2026-01-03',
    anzahlRunden: 10,
    mitspieler: ['Nele', 'Lennart', 'Lukas', 'Eila'],
    gewonnen: 8,
    notiz: 'Teamspiel',
  },
]
