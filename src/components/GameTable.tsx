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
                entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="games-table__game">{entry.spielName}</td>
                    <td>{entry.anzahlRunden}</td>
                    <td>{formatDate(entry.datum)}</td>
                    <td>{entry.mitspieler.join(', ') || 'Solo'}</td>
                    <td className="games-table__result">
                      <Badge
                        className="result-badge"
                        style={{
                          background: 'rgba(125, 211, 252, 0.08)',
                          borderColor: 'rgba(125, 211, 252, 0.22)',
                          color: 'var(--muted-strong)',
                        }}
                      >
                        {entry.gewonnen} von {entry.anzahlRunden} gewonnen
                      </Badge>
                    </td>
                    <td className="games-table__note">{entry.notiz}</td>
                    <td>
                      <div className="row-actions">
                        <Button
                          aria-label={`${entry.spielName} bearbeiten`}
                          onClick={() => onEdit(entry)}
                          title="Eintrag bearbeiten"
                          variant="ghost"
                        >
                          <Pencil data-icon="inline-start" />
                        </Button>
                        <Button
                          aria-label={`${entry.spielName} löschen`}
                          onClick={() => onDelete(entry.id)}
                          title="Eintrag löschen"
                          variant="ghost"
                        >
                          <Trash2 data-icon="inline-start" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
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
