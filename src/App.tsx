import { useMemo, useState } from 'react'
import { BarChart3, Database, Dice5 } from 'lucide-react'
import './index.css'
import { buildCounts, filterEntries, getPlayers, getYears, summarizeEntries } from './lib/analytics'
import { exportEntriesAsCsv } from './lib/csv'
import { useGameEntries } from './hooks/useGameEntries'
import { isSupabaseConfigured } from './storage/gameEntryRepository'
import type { GameEntry, GameEntryDraft, GameFilters } from './types'
import { ChartsPanel } from './components/ChartsPanel'
import { DashboardCards } from './components/DashboardCards'
import { GameEntryForm } from './components/GameEntryForm'
import { GameFiltersBar } from './components/GameFiltersBar'
import { GameTable } from './components/GameTable'

const initialFilters: GameFilters = {
  suche: '',
  jahr: 'alle',
  mitspieler: 'alle',
  gewinnstatus: 'alle',
}

function App() {
  const { entries, error, addEntry, updateEntry, deleteEntry } = useGameEntries()
  const [filters, setFilters] = useState<GameFilters>(initialFilters)
  const [editingEntry, setEditingEntry] = useState<GameEntry | null>(null)

  const years = useMemo(() => getYears(entries), [entries])
  const players = useMemo(() => getPlayers(entries), [entries])

  const filteredTableEntries = useMemo(() => {
    const search = filters.suche.trim().toLocaleLowerCase('de')

    return entries.filter((entry) => {
      const matchesSearch =
        !search ||
        entry.spielName.toLocaleLowerCase('de').includes(search) ||
        entry.notiz?.toLocaleLowerCase('de').includes(search)
      const matchesYear = filters.jahr === 'alle' || entry.datum.startsWith(filters.jahr)
      const matchesPlayer =
        filters.mitspieler === 'alle' || entry.mitspieler.includes(filters.mitspieler)
      const matchesStatus =
        filters.gewinnstatus === 'alle' ||
        (filters.gewinnstatus === 'gewonnen' && entry.gewonnen > 0) ||
        (filters.gewinnstatus === 'verloren' && entry.gewonnen === 0)

      return matchesSearch && matchesYear && matchesPlayer && matchesStatus
    })
  }, [entries, filters])

  const dashboardEntries = useMemo(
    () => filterEntries(entries, filters.jahr),
    [entries, filters.jahr],
  )
  const summary = useMemo(() => summarizeEntries(dashboardEntries), [dashboardEntries])
  const counts = useMemo(() => buildCounts(dashboardEntries), [dashboardEntries])

  function handleSubmit(draft: GameEntryDraft) {
    if (editingEntry) {
      updateEntry(editingEntry.id, draft)
      setEditingEntry(null)
      return
    }

    addEntry(draft)
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <div className="app-header__mark">
            <Dice5 aria-hidden="true" />
            Spielejournal
          </div>
          <h1>Gesellschaftsspiele dokumentieren und auswerten</h1>
          <p>
            Schnelle Erfassung, Notizen-App-ähnliche Tabelle und laufend aktuelle
            Jahresauswertungen mit Diagrammen.
          </p>
        </div>
        <div className="app-header__aside" aria-label="Lokale Speicherung">
          <Database aria-hidden="true" />
          <span>{isSupabaseConfigured ? 'Supabase Cloud aktiv' : 'localStorage aktiv'}</span>
        </div>
      </header>

      {error ? <div className="app-alert">{error}</div> : null}

      <section className="workspace">
        <div className="workspace__main">
          <div className="section-heading">
            <BarChart3 aria-hidden="true" />
            <div>
              <h2>Dashboard</h2>
              <p>Alle Kennzahlen reagieren auf den Jahresfilter.</p>
            </div>
          </div>
          <DashboardCards summary={summary} />
          <ChartsPanel games={counts.games} players={counts.players} results={counts.results} />
        </div>

        <aside className="workspace__side">
          <GameEntryForm
            editingEntry={editingEntry}
            key={editingEntry?.id ?? 'new-entry'}
            onCancelEdit={() => setEditingEntry(null)}
            onSubmit={handleSubmit}
          />
        </aside>
      </section>

      <section className="table-section">
        <GameFiltersBar
          filters={filters}
          onExport={() => exportEntriesAsCsv(filteredTableEntries)}
          onFiltersChange={setFilters}
          players={players}
          years={years}
        />
        <GameTable
          entries={filteredTableEntries}
          onDelete={deleteEntry}
          onEdit={setEditingEntry}
        />
      </section>
    </main>
  )
}

export default App
