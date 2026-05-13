import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(value: string) {
  if (!value) return ''

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

export function getEntryYear(value: string) {
  return value.slice(0, 4)
}

export function parseNameList(value: string) {
  return value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
}

export function clampWins(wins: number, rounds: number) {
  return Math.max(0, Math.min(wins, rounds))
}
