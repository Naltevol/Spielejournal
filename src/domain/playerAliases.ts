function aliasKey(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('de')
}

const playerAliasGroups: Record<string, string[]> = {
  // Exact, conservative aliases can be added here later.
  // Keep distinct people distinct: do not alias "Lennart S" to "Lennart S." automatically.
}

const aliasMap = new Map<string, string>()

for (const [canonical, aliases] of Object.entries(playerAliasGroups)) {
  aliasMap.set(aliasKey(canonical), canonical)
  for (const alias of aliases) aliasMap.set(aliasKey(alias), canonical)
}

export function normalizePlayerName(value: string) {
  const cleaned = value.trim().replace(/\s+/g, ' ')
  if (!cleaned) return cleaned
  return aliasMap.get(aliasKey(cleaned)) ?? cleaned
}

export function playerIdentityKey(value: string) {
  return normalizePlayerName(value).toLocaleLowerCase('de')
}

export function normalizePlayers(values: string[]) {
  const players: string[] = []
  const seen = new Set<string>()

  for (const value of values) {
    const normalized = normalizePlayerName(value)
    if (!normalized) continue

    const key = playerIdentityKey(normalized)
    if (seen.has(key)) continue
    seen.add(key)
    players.push(normalized)
  }

  return players
}

function suggestionKey(value: string) {
  return normalizePlayerName(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de')
}

export function getKnownPlayerNames(entries: { mitspieler: string[] }[]) {
  return normalizePlayers(entries.flatMap((entry) => entry.mitspieler)).sort((a, b) =>
    a.localeCompare(b, 'de'),
  )
}

export function getPlayerSuggestions(value: string, knownPlayerNames: string[], limit = 5) {
  const search = suggestionKey(value)
  if (!search) return []

  const normalizedNames = normalizePlayers(knownPlayerNames)
  return normalizedNames
    .filter((name) => {
      const key = suggestionKey(name)
      return key !== search && key.startsWith(search)
    })
    .sort((a, b) => a.localeCompare(b, 'de'))
    .slice(0, limit)
}

export function getCurrentPlayerToken(value: string) {
  const segments = value.split(',')
  return segments[segments.length - 1]?.trim() ?? ''
}

export function replaceCurrentPlayerToken(value: string, playerName: string) {
  const segments = value.split(',')
  segments[segments.length - 1] = ` ${playerName}`
  return segments.map((segment) => segment.trim()).filter(Boolean).join(', ')
}
