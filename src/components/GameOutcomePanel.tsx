import { useMemo, useState } from 'react'
import type { GameOutcomeSummary } from '../lib/analytics'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import './GameOutcomePanel.css'

type GameOutcomeMode = 'won' | 'lost' | 'rate'

type GameOutcomePanelProps = {
  outcomes: GameOutcomeSummary[]
}

type RankedOutcome = GameOutcomeSummary & {
  displayValue: string
  detail: string
  metric: number
}

const MODE_OPTIONS: Array<{ label: string; value: GameOutcomeMode }> = [
  { label: 'Meist gewonnen', value: 'won' },
  { label: 'Meist verloren', value: 'lost' },
  { label: 'Beste Gewinnquote', value: 'rate' },
]

function formatPercent(value: number) {
  return `${Math.round(value * 100)} %`
}

function buildRankedOutcomes(outcomes: GameOutcomeSummary[], mode: GameOutcomeMode): RankedOutcome[] {
  const rows = mode === 'rate'
    ? outcomes.filter((outcome) => outcome.played >= 3)
    : outcomes

  return [...rows]
    .sort((a, b) => {
      if (mode === 'won') return b.won - a.won || b.played - a.played || a.name.localeCompare(b.name, 'de')
      if (mode === 'lost') return b.lost - a.lost || b.played - a.played || a.name.localeCompare(b.name, 'de')
      return b.winRate - a.winRate || b.played - a.played || a.name.localeCompare(b.name, 'de')
    })
    .slice(0, 10)
    .map((outcome) => {
      if (mode === 'won') {
        return {
          ...outcome,
          detail: `${outcome.won} von ${outcome.played} Runden gewonnen`,
          displayValue: `${outcome.won} gewonnen`,
          metric: outcome.won,
        }
      }

      if (mode === 'lost') {
        return {
          ...outcome,
          detail: `${outcome.lost} von ${outcome.played} Runden verloren`,
          displayValue: `${outcome.lost} verloren`,
          metric: outcome.lost,
        }
      }

      return {
        ...outcome,
        detail: `${outcome.won} von ${outcome.played} gewonnen`,
        displayValue: formatPercent(outcome.winRate),
        metric: outcome.winRate,
      }
    })
}

function getEmptyLabel(mode: GameOutcomeMode) {
  if (mode === 'rate') return 'Noch kein Spiel mit mindestens 3 gespielten Runden.'
  return 'Keine Daten fuer diesen Filter.'
}

function GameOutcomeRow({ mode, outcome, maxMetric }: {
  maxMetric: number
  mode: GameOutcomeMode
  outcome: RankedOutcome
}) {
  const width = mode === 'rate'
    ? outcome.metric * 100
    : maxMetric > 0
      ? (outcome.metric / maxMetric) * 100
      : 0

  return (
    <li className="game-outcome-row">
      <div className="game-outcome-row__header">
        <span className="game-outcome-row__name">{outcome.name}</span>
        <span className="game-outcome-row__value">{outcome.displayValue}</span>
      </div>
      <div className="game-outcome-row__track" aria-hidden="true">
        <div
          className={`game-outcome-row__bar game-outcome-row__bar--${mode}`}
          style={{ width: `${Math.max(4, Math.min(100, width))}%` }}
        />
      </div>
      <div className="game-outcome-row__meta">
        <span>{outcome.detail}</span>
        <span>{formatPercent(outcome.winRate)} Gewinnquote</span>
      </div>
    </li>
  )
}

export function GameOutcomePanel({ outcomes }: GameOutcomePanelProps) {
  const [mode, setMode] = useState<GameOutcomeMode>('won')
  const rankedOutcomes = useMemo(() => buildRankedOutcomes(outcomes, mode), [outcomes, mode])
  const maxMetric = Math.max(...rankedOutcomes.map((outcome) => outcome.metric), 0)

  return (
    <Card className="game-outcome-panel">
      <CardHeader>
        <div className="game-outcome-panel__intro">
          <CardTitle>Gewonnen und verloren nach Spiel</CardTitle>
          <CardDescription>Top 10 nach absoluten Siegen, Niederlagen oder Gewinnquote.</CardDescription>
        </div>
        <div className="game-outcome-panel__tabs" aria-label="Analyse wechseln">
          {MODE_OPTIONS.map((option) => (
            <Button
              aria-pressed={mode === option.value}
              className="game-outcome-panel__tab"
              key={option.value}
              onClick={() => setMode(option.value)}
              variant={mode === option.value ? 'default' : 'ghost'}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {rankedOutcomes.length ? (
          <ol className="game-outcome-list">
            {rankedOutcomes.map((outcome) => (
              <GameOutcomeRow
                key={outcome.name}
                maxMetric={maxMetric}
                mode={mode}
                outcome={outcome}
              />
            ))}
          </ol>
        ) : (
          <div className="game-outcome-panel__empty">{getEmptyLabel(mode)}</div>
        )}
      </CardContent>
    </Card>
  )
}
