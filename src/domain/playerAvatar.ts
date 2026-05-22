export type PlayerAvatar = {
  initials: string
  color: string
}

const avatarColors = [
  '#7dd3fc',
  '#c084fc',
  '#34d399',
  '#facc15',
  '#fb7185',
  '#a5b4fc',
]

function hashName(value: string) {
  let hash = 0
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash
}

export function getPlayerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 1).toLocaleUpperCase('de')
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase('de')
}

export function getPlayerAvatar(name: string): PlayerAvatar {
  return {
    initials: getPlayerInitials(name),
    color: avatarColors[hashName(name) % avatarColors.length],
  }
}
