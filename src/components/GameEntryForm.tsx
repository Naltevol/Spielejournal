import { Check, Save, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { GameEntry, GameEntryDraft } from '../types'
import { normalizeGameDraft } from '../domain/dataNormalization'
import { getGameNameSuggestion } from '../domain/gameAliases'
import { clampWins, parseNameList } from '../lib/utils'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from './ui/Field'
import { Input, Textarea } from './ui/FormControls'

const emptyDraft: GameEntryDraft = {
  spielName: '',
  datum: new Date().toISOString().slice(0, 10),
  anzahlRunden: 1,
  mitspieler: [],
  gewonnen: 0,
  notiz: '',
}

function draftFromEntry(entry?: GameEntry | null): GameEntryDraft {
  if (!entry) return emptyDraft

  return {
    spielName: entry.spielName,
    datum: entry.datum,
    anzahlRunden: entry.anzahlRunden,
    mitspieler: entry.mitspieler,
    gewonnen: entry.gewonnen,
    notiz: entry.notiz ?? '',
  }
}

type GameEntryFormProps = {
  editingEntry?: GameEntry | null
  existingGameNames: string[]
  onSubmit: (draft: GameEntryDraft) => void
  onCancelEdit: () => void
}

export function GameEntryForm({
  editingEntry,
  existingGameNames,
  onSubmit,
  onCancelEdit,
}: GameEntryFormProps) {
  const [draft, setDraft] = useState<GameEntryDraft>(() => draftFromEntry(editingEntry))
  const [playersText, setPlayersText] = useState(() =>
    editingEntry?.mitspieler.join(', ') ?? '',
  )
  const [ignoredSuggestion, setIgnoredSuggestion] = useState<string | null>(null)

  const suggestion = useMemo(() => {
    const nextSuggestion = getGameNameSuggestion(draft.spielName, existingGameNames)
    if (!nextSuggestion || nextSuggestion === ignoredSuggestion) return null
    if (nextSuggestion === draft.spielName.trim()) return null
    return nextSuggestion
  }, [draft.spielName, existingGameNames, ignoredSuggestion])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const anzahlRunden = Math.max(1, Number(draft.anzahlRunden) || 1)
    const gewonnen = clampWins(Number(draft.gewonnen) || 0, anzahlRunden)

    onSubmit(normalizeGameDraft({
      ...draft,
      spielName: draft.spielName,
      datum: draft.datum,
      anzahlRunden,
      mitspieler: parseNameList(playersText),
      gewonnen,
      notiz: draft.notiz?.trim(),
    }))

    if (!editingEntry) {
      setDraft(emptyDraft)
      setPlayersText('')
      setIgnoredSuggestion(null)
    }
  }

  return (
    <Card className="entry-form-card">
      <CardHeader>
        <CardTitle>{editingEntry ? 'Eintrag bearbeiten' : 'Neue Runde erfassen'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="entry-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="spielName">Spiel</FieldLabel>
              <Input
                id="spielName"
                onChange={(event) => {
                  setDraft((current) => ({ ...current, spielName: event.target.value }))
                  setIgnoredSuggestion(null)
                }}
                placeholder="z. B. Skull"
                required
                value={draft.spielName}
              />
              {suggestion ? (
                <div className="suggestion-box">
                  <span>Meintest du {suggestion}?</span>
                  <div className="suggestion-box__actions">
                    <Button
                      onClick={() => {
                        setDraft((current) => ({ ...current, spielName: suggestion }))
                        setIgnoredSuggestion(null)
                      }}
                      variant="secondary"
                    >
                      <Check data-icon="inline-start" />
                      Übernehmen
                    </Button>
                    <Button onClick={() => setIgnoredSuggestion(suggestion)} variant="ghost">
                      Ignorieren
                    </Button>
                  </div>
                </div>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="datum">Datum</FieldLabel>
              <Input
                id="datum"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, datum: event.target.value }))
                }
                required
                type="date"
                value={draft.datum}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="anzahlRunden">Runden</FieldLabel>
              <Input
                id="anzahlRunden"
                min={1}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    anzahlRunden: Number(event.target.value),
                  }))
                }
                required
                type="number"
                value={draft.anzahlRunden}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="gewonnen">Gewonnen</FieldLabel>
              <Input
                id="gewonnen"
                min={0}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, gewonnen: Number(event.target.value) }))
                }
                type="number"
                value={draft.gewonnen}
              />
              <FieldDescription>Nur die Anzahl der gewonnenen Runden. Texte gehören in die Notiz.</FieldDescription>
            </Field>
          </FieldGroup>

          <Field>
            <FieldLabel htmlFor="mitspieler">Mitspieler</FieldLabel>
            <Input
              id="mitspieler"
              onChange={(event) => setPlayersText(event.target.value)}
              placeholder="Nele, Lennart, Lukas"
              value={playersText}
            />
            <FieldDescription>Namen mit Komma trennen. Doppelte Namen bleiben erhalten; ein zweiter Lennart wird als Lennart S. geführt.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="notiz">Notiz</FieldLabel>
            <Textarea
              id="notiz"
              onChange={(event) =>
                setDraft((current) => ({ ...current, notiz: event.target.value }))
              }
              placeholder="z. B. Teamspiel oder gewonnen mit Lennart und Fenja"
              value={draft.notiz}
            />
          </Field>

          <div className="form-actions">
            <Button type="submit">
              <Save data-icon="inline-start" />
              {editingEntry ? 'Speichern' : 'Hinzufügen'}
            </Button>
            {editingEntry ? (
              <Button onClick={onCancelEdit} variant="ghost">
                <X data-icon="inline-start" />
                Abbrechen
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

