import { useCallback, useEffect, useMemo, useState } from 'react'
import { gameEntryRepository, isSupabaseConfigured } from '../storage/gameEntryRepository'
import type { DataSourceDiagnostics, GameEntry, GameEntryDraft } from '../types'

function createId() {
  if ('crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID()
  }

  return String(Date.now()) + '-' + Math.random().toString(16).slice(2)
}

const initialDiagnostics: DataSourceDiagnostics = {
  isSupabaseConfigured,
  isLoginActive: isSupabaseConfigured,
  source: isSupabaseConfigured ? 'supabase' : 'localStorage',
  rawRowCount: null,
  lastError: null,
  firstRawRow: null,
}

export function useGameEntries(isEnabled = true, userId?: string) {
  const [entries, setEntries] = useState<GameEntry[]>([])
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [diagnostics, setDiagnostics] = useState<DataSourceDiagnostics>(initialDiagnostics)

  useEffect(() => {
    if (!isEnabled) return

    gameEntryRepository
      .list(userId)
      .then((result) => {
        setEntries(result.entries)
        setDiagnostics(result.diagnostics)
        setError(result.diagnostics.lastError)
      })
      .catch((reason: unknown) => {
        const message = reason instanceof Error ? reason.message : 'Daten konnten nicht geladen werden.'
        setError(message)
        setDiagnostics((current) => ({ ...current, lastError: message }))
      })
      .finally(() => setIsReady(true))
  }, [isEnabled, userId])

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) =>
          new Date(b.datum).getTime() - new Date(a.datum).getTime() ||
          a.spielName.localeCompare(b.spielName, 'de'),
      ),
    [entries],
  )

  const addEntry = useCallback(async (draft: GameEntryDraft) => {
    const optimisticEntry = { ...draft, id: createId(), userId }
    setEntries((current) => [optimisticEntry, ...current])

    try {
      const savedEntry = await gameEntryRepository.create(optimisticEntry)
      setEntries((current) =>
        current.map((entry) => (entry.id === optimisticEntry.id ? savedEntry : entry)),
      )
      setError(null)
      setDiagnostics((current) => ({
        ...current,
        lastError: null,
        rawRowCount: current.rawRowCount === null ? null : current.rawRowCount + 1,
      }))
    } catch (reason) {
      setEntries((current) => current.filter((entry) => entry.id !== optimisticEntry.id))
      const message = reason instanceof Error ? reason.message : 'Eintrag konnte nicht gespeichert werden.'
      setError(message)
      setDiagnostics((current) => ({ ...current, lastError: message }))
    }
  }, [userId])

  const updateEntry = useCallback(async (id: string, draft: GameEntryDraft) => {
    const previousEntries = entries
    const optimisticEntry = { ...draft, id }
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? optimisticEntry : entry)),
    )

    try {
      const savedEntry = await gameEntryRepository.update(id, draft)
      setEntries((current) =>
        current.map((entry) => (entry.id === id ? savedEntry : entry)),
      )
      setError(null)
      setDiagnostics((current) => ({ ...current, lastError: null }))
    } catch (reason) {
      setEntries(previousEntries)
      const message = reason instanceof Error ? reason.message : 'Eintrag konnte nicht aktualisiert werden.'
      setError(message)
      setDiagnostics((current) => ({ ...current, lastError: message }))
    }
  }, [entries])

  const deleteEntry = useCallback(async (id: string) => {
    const previousEntries = entries
    setEntries((current) => current.filter((entry) => entry.id !== id))

    try {
      await gameEntryRepository.delete(id)
      setError(null)
      setDiagnostics((current) => ({
        ...current,
        lastError: null,
        rawRowCount: current.rawRowCount === null ? null : Math.max(0, current.rawRowCount - 1),
      }))
    } catch (reason) {
      setEntries(previousEntries)
      const message = reason instanceof Error ? reason.message : 'Eintrag konnte nicht gelöscht werden.'
      setError(message)
      setDiagnostics((current) => ({ ...current, lastError: message }))
    }
  }, [entries])

  return {
    entries: sortedEntries,
    isReady,
    error,
    diagnostics,
    addEntry,
    updateEntry,
    deleteEntry,
  }
}
