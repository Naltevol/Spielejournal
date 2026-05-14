import { Download, Search } from 'lucide-react'
import type { GameFilters } from '../types'
import { Button } from './ui/Button'
import { Field, FieldLabel } from './ui/Field'
import { Input, Select } from './ui/FormControls'

type GameFiltersBarProps = {
  filters: GameFilters
  years: string[]
  months: string[]
  players: string[]
  onFiltersChange: (filters: GameFilters) => void
  onExport: () => void
}

const monthNames = new Intl.DateTimeFormat('de-DE', { month: 'long' })

function formatMonth(month: string) {
  return monthNames.format(new Date('2026-' + month + '-01T12:00:00'))
}

export function GameFiltersBar({
  filters,
  years,
  months,
  players,
  onFiltersChange,
  onExport,
}: GameFiltersBarProps) {
  return (
    <div className="filters-bar">
      <Field className="filters-bar__search">
        <FieldLabel htmlFor="suche">Suche</FieldLabel>
        <div className="input-with-icon">
          <Search aria-hidden="true" />
          <Input
            id="suche"
            onChange={(event) =>
              onFiltersChange({ ...filters, suche: event.target.value })
            }
            placeholder="Spiel oder Notiz suchen"
            value={filters.suche}
          />
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor="jahr">Jahr</FieldLabel>
        <Select
          id="jahr"
          onChange={(event) => onFiltersChange({ ...filters, jahr: event.target.value, monat: 'alle' })}
          value={filters.jahr}
        >
          <option value="alle">Alle Jahre</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="monat">Monat</FieldLabel>
        <Select
          id="monat"
          onChange={(event) => onFiltersChange({ ...filters, monat: event.target.value })}
          value={filters.monat}
        >
          <option value="alle">Alle Monate</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {formatMonth(month)}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="mitspielerFilter">Mitspieler</FieldLabel>
        <Select
          id="mitspielerFilter"
          onChange={(event) =>
            onFiltersChange({ ...filters, mitspieler: event.target.value })
          }
          value={filters.mitspieler}
        >
          <option value="alle">Alle</option>
          {players.map((player) => (
            <option key={player} value={player}>
              {player}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="gewinnstatus">Status</FieldLabel>
        <Select
          id="gewinnstatus"
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              gewinnstatus: event.target.value as GameFilters['gewinnstatus'],
            })
          }
          value={filters.gewinnstatus}
        >
          <option value="alle">Alle</option>
          <option value="gewonnen">Mit Gewinn</option>
          <option value="verloren">Ohne Gewinn</option>
        </Select>
      </Field>

      <Button className="filters-bar__export" onClick={onExport} variant="secondary">
        <Download data-icon="inline-start" />
        CSV exportieren
      </Button>
    </div>
  )
}

