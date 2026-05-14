import { Pencil, Trash2 } from 'lucide-react'
import type { GameEntry } from '../types'
import { formatDate } from '../lib/utils'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

type GameTableProps = {
  entries: GameEntry[]
  onEdit: (entry: GameEntry) => void
  onDelete: (id: string) => void
}

function getResultDisplay(entry: GameEntry) {
  const won = entry.gewonnen
  const total = entry.anzahlRunden

  if (won === 0) {
    return {
      className: 'result-badge result-badge--lost',
      label: `Verloren · ${won} von ${total}`,
      shortLabel: 'Verloren',
    }
  }

  if (won === total) {
    return {
      className: 'result-badge result-badge--won',
      label: `Gewonnen · ${won} von ${total}`,
      shortLabel: 'Gewonnen',
    }
  }

  return {
    className: 'result-badge result-badge--partial',
    label: `Teilweise gewonnen · ${won} von ${total}`,
    shortLabel: `${won}/${total} gewonnen`,
  }
}

export function GameTable({ entries, onEdit, onDelete }: GameTableProps) {
  return (
    <Card className="table-card">
      <CardHeader>
        <CardTitle>Spiele</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="table-scroll">
          <table className="games-table">
            <thead>
              <tr>
                <th>Spiel</th>
                <th>Häufigkeit</th>
                <th>Datum</th>
                <th>Gespielt mit</th>
                <th>Ergebnis</th>
                <th>Notiz</th>
                <th aria-label="Aktionen" />
              </tr>
            </thead>
            <tbody>
              {entries.length ? (
                entries.map((entry) => {
                  const result = getResultDisplay(entry)

                  return (
                    <tr key={entry.id}>
                      <td className="games-table__game">{entry.spielName}</td>
                      <td>{entry.anzahlRunden}</td>
                      <td>{formatDate(entry.datum)}</td>
                      <td>{entry.mitspieler.join(', ') || 'Solo'}</td>
                      <td>
                        <Badge className={result.className} title={result.label}>
                          <span className="result-badge__full">{result.label}</span>
                          <span className="result-badge__short">{result.shortLabel}</span>
                        </Badge>
                      </td>
                      <td className="games-table__note">{entry.notiz}</td>
                      <td>
                        <div className="row-actions">
                          <Button
                            aria-label={`${entry.spielName} bearbeiten`}
                            onClick={() => onEdit(entry)}
                            variant="ghost"
                          >
                            <Pencil data-icon="inline-start" />
                          </Button>
                          <Button
                            aria-label={`${entry.spielName} löschen`}
                            onClick={() => onDelete(entry.id)}
                            variant="ghost"
                          >
                            <Trash2 data-icon="inline-start" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td className="games-table__empty" colSpan={7}>
                    Keine Einträge für diese Filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
