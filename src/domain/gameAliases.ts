const aliasGroups: Record<string, string[]> = {
  'Bomb Busters': ['BombBusters', 'Bomb Busters'],
  'Flip 7': ['Flip7', 'Flip 7'],
  GAP: ['GAP', 'Gap', 'Gab'],
  'Lovecraft Letter': ['Lovecraft Letter', 'LoveCraftLetter', 'Lovekraft Letter'],
  'Sea, Salt & Paper': ['Sea, Salt und Paper', 'Sea, Salt & Paper'],
  Quoridor: ['Qouridor', 'Quoridor'],
  Wizard: ['Wizard'],
  'Siedler von Catan': ['Siedler', 'Siedler von Catan'],
  'Poesie für Neandertaler': ['Poesie', 'Poesie für Neandertaler'],
}

function key(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de')
    .replace(/&/g, 'und')
    .replace(/[^a-z0-9]+/g, '')
}

const aliasMap = new Map<string, string>()

for (const [canonical, aliases] of Object.entries(aliasGroups)) {
  aliasMap.set(key(canonical), canonical)
  for (const alias of aliases) {
    aliasMap.set(key(alias), canonical)
  }
}

export const canonicalGameNames = Object.keys(aliasGroups).sort((a, b) => a.localeCompare(b, 'de'))

export function normalizeGameName(value: string) {
  const cleaned = value.trim().replace(/\s+/g, ' ')
  if (!cleaned) return cleaned
  return aliasMap.get(key(cleaned)) ?? cleaned
}

function levenshtein(a: string, b: string) {
  const rows = Array.from({ length: a.length + 1 }, (_, index) => [index])
  for (let column = 1; column <= b.length; column += 1) rows[0][column] = column

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + cost,
      )
    }
  }

  return rows[a.length][b.length]
}

export function getGameNameSuggestion(value: string, existingGameNames: string[]) {
  const cleaned = value.trim()
  if (cleaned.length < 2) return null

  const normalized = normalizeGameName(cleaned)
  if (normalized !== cleaned) return normalized

  const candidates = [...new Set([...canonicalGameNames, ...existingGameNames.map(normalizeGameName)])]
  const inputKey = key(cleaned)
  let best: { name: string; distance: number } | null = null

  for (const candidate of candidates) {
    const candidateKey = key(candidate)
    if (!candidateKey || candidateKey === inputKey) continue
    if (candidateKey.includes(inputKey) || inputKey.includes(candidateKey)) return candidate

    const distance = levenshtein(inputKey, candidateKey)
    if (!best || distance < best.distance) best = { name: candidate, distance }
  }

  if (!best) return null
  const threshold = inputKey.length <= 5 ? 1 : 2
  return best.distance <= threshold ? best.name : null
}

