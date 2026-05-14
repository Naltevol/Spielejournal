import { useMemo, useState } from 'react'
import { BarChart3, Database, Dice5 } from 'lucide-react'
import './index.css'
import { buildCounts, filterEntries, getMonths, getPlayers, getYears, summarizeEntries } from './lib/analytics'
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
  monat: 'alle',
  mitspieler: 'alle',
  gewinnstatus: 'alle',
}

function App() {
  const { entries, isReady, error, diagnostics, addEntry, updateEntry, deleteEntry } = useGameEntries(true)
  const [filters, setFilters] = useState<GameFilters>(initialFilters)
  const [editingEntry, setEditingEntry] = useState<GameEntry | null>(null)

  const years = useMemo(() => getYears(entries), [entries])
  const months = useMemo(() => getMonths(entries, filters.jahr), [entries, filters.jahr])
  const players = useMemo(() => getPlayers(entries), [entries])
  const gameNames = useMemo(() => [...new Set(entries.map((entry) => entry.spielName))], [entries])

  const filteredTableEntries = useMemo(() => {
    const search = filters.suche.trim().toLocaleLowerCase('de')

    return filterEntries(entries, filters.jahr, filters.monat).filter((entry) => {
      const matchesSearch =
        !search ||
        entry.spielName.toLocaleLowerCase('de').includes(search) ||
        entry.notiz?.toLocaleLowerCase('de').includes(search)
      const matchesPlayer =
        filters.mitspieler === 'alle' || entry.mitspieler.includes(filters.mitspieler)
      const matchesStatus =
        filters.gewinnstatus === 'alle' ||
        (filters.gewinnstatus === 'gewonnen' && entry.gewonnen > 0) ||
        (filters.gewinnstatus === 'verloren' && entry.gewonnen === 0)

      return matchesSearch && matchesPlayer && matchesStatus
    })
  }, [entries, filters])

  const dashboardEntries = useMemo(
    () => filterEntries(entries, filters.jahr, filters.monat),
    [entries, filters.jahr, filters.monat],
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
            Schnelle Erfassung, bereinigte Spielnamen und gemeinsame Cloud-Daten.
          </p>
        </div>
        <div className="app-header__actions">
          <div className="app-header__aside" aria-label="Speicherstatus">
            <Database aria-hidden="true" />
            <span>{isSupabaseConfigured ? 'Supabase Cloud öffentlich' : 'localStorage aktiv'}</span>
            <small>{isReady ? `${entries.length} Einträge geladen` : 'Daten werden geladen...'}</small>
          </div>
        </div>
      </header>

      {error ? <div className="app-alert">{error}</div> : null}
      {isReady && !error && isSupabaseConfigured && entries.length === 0 ? (
        <div className="app-alert">
          Supabase ist verbunden, aber die öffentliche Abfrage liefert 0 Einträge. Prüfe in Supabase die
          anon-Select-Policy für <code>game_entries</code> und ob Vercel mit dem richtigen Projekt gebaut wurde.
        </div>
      ) : null}
      {isReady && !isSupabaseConfigured ? (
        <div className="app-alert">
          Supabase ist in diesem Build nicht konfiguriert. Prüfe in Vercel die Production-Variablen
          <code>VITE_SUPABASE_URL</code> und <code>VITE_SUPABASE_ANON_KEY</code> und löse danach ein Redeploy aus.
        </div>
      ) : null}

      <section className="diagnostics-panel" aria-label="Datenlade-Diagnose">
        <div><strong>Supabase konfiguriert:</strong> {diagnostics.isSupabaseConfigured ? 'ja' : 'nein'}</div>
        <div><strong>Datenquelle:</strong> {diagnostics.source}</div>
        <div><strong>Rohdatensätze aus Supabase/localStorage:</strong> {diagnostics.rawRowCount ?? 'unbekannt'}</div>
        <div><strong>Letzter Ladefehler:</strong> {diagnostics.lastError ?? 'keiner'}</div>
        <details>
          <summary>Erster Rohdatensatz</summary>
          <pre>{diagnostics.firstRawRow ? JSON.stringify(diagnostics.firstRawRow, null, 2) : 'kein Rohdatensatz geladen'}</pre>
        </details>
      </section>

      <section className="workspace">
        <div className="workspace__main">
          <div className="section-heading">
            <BarChart3 aria-hidden="true" />
            <div>
              <h2>Dashboard</h2>
              <p>Alle Kennzahlen reagieren auf Jahr und Monat.</p>
            </div>
          </div>
          <DashboardCards summary={summary} />
          <ChartsPanel games={counts.games} players={counts.players} results={counts.results} />
        </div>

        <aside className="workspace__side">
          <GameEntryForm
            editingEntry={editingEntry}
            existingGameNames={gameNames}
            key={editingEntry?.id ?? 'new-entry'}
            onCancelEdit={() => setEditingEntry(null)}
            onSubmit={handleSubmit}
          />
        </aside>
      </section>

      <section className="table-section">
        <GameFiltersBar
          filters={filters}
          months={months}
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

