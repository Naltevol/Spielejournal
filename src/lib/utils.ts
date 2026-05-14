import { clsx, type ClassValue } from 'clsx'
import { normalizePlayers } from '../domain/dataNormalization'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(value: string) {
  if (!value) return ''

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value + 'T12:00:00'))
}

export function getEntryYear(value: string) {
  return value.slice(0, 4)
}

export function getEntryMonth(value: string) {
  return value.slice(5, 7)
}

export function parseNameList(value: string) {
  return normalizePlayers(value.split(','))
}

export function clampWins(wins: number, rounds: number) {
  return Math.max(0, Math.min(wins, rounds))
}

