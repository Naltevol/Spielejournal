import { useCallback, useEffect, useMemo, useState } from 'react'
import { gameEntryRepository } from '../storage/gameEntryRepository'
import type { GameEntry, GameEntryDraft } from '../types'

function createId() {
  if ('crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID()
  }

  return String(Date.now()) + '-' + Math.random().toString(16).slice(2)
}

export function useGameEntries(isEnabled = true) {
  const [entries, setEntries] = useState<GameEntry[]>([])
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEnabled) return

    gameEntryRepository
      .list()
      .then((loadedEntries) => {
        setEntries(loadedEntries)
        setError(null)
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'Daten konnten nicht geladen werden.')
      })
      .finally(() => setIsReady(true))
  }, [isEnabled])

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
    const optimisticEntry = { ...draft, id: createId() }
    setEntries((current) => [optimisticEntry, ...current])

    try {
      const savedEntry = await gameEntryRepository.create(optimisticEntry)
      setEntries((current) =>
        current.map((entry) => (entry.id === optimisticEntry.id ? savedEntry : entry)),
      )
      setError(null)
    } catch (reason) {
      setEntries((current) => current.filter((entry) => entry.id !== optimisticEntry.id))
      setError(reason instanceof Error ? reason.message : 'Eintrag konnte nicht gespeichert werden.')
    }
  }, [])

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
    } catch (reason) {
      setEntries(previousEntries)
      setError(reason instanceof Error ? reason.message : 'Eintrag konnte nicht aktualisiert werden.')
    }
  }, [entries])

  const deleteEntry = useCallback(async (id: string) => {
    const previousEntries = entries
    setEntries((current) => current.filter((entry) => entry.id !== id))

    try {
      await gameEntryRepository.delete(id)
      setError(null)
    } catch (reason) {
      setEntries(previousEntries)
      setError(reason instanceof Error ? reason.message : 'Eintrag konnte nicht gelöscht werden.')
    }
  }, [entries])

  return {
    entries: sortedEntries,
    isReady,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
  }
}

