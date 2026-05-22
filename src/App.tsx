import { useMemo, useState } from 'react'
import { BarChart3, Database, Dice5, LogOut } from 'lucide-react'
import './index.css'
import './playerChips.css'
import {
  buildCounts,
  buildGameOutcomeSummaries,
  filterEntries,
  getMonths,
  getPlayers,
  getYears,
  summarizeEntries,
} from './lib/analytics'
import { exportEntriesAsCsv } from './lib/csv'
import { useAuth } from './hooks/useAuth'
import { useGameEntries } from './hooks/useGameEntries'
import { isSupabaseConfigured } from './storage/gameEntryRepository'
import type { GameEntry, GameEntryDraft, GameFilters } from './types'
import { ChartsPanel } from './components/ChartsPanel'
import { DashboardCards } from './components/DashboardCards'
import { GameEntryForm } from './components/GameEntryForm'
import { GameFiltersBar } from './components/GameFiltersBar'
import { GameOutcomePanel } from './components/GameOutcomePanel'
import { GameTable } from './components/GameTable'
import { LoginPage } from './components/auth/LoginPage'
import { Button } from './components/ui/Button'

const initialFilters: GameFilters = {
  suche: '',
  jahr: 'alle',
  monat: 'alle',
  mitspieler: 'alle',
  gewinnstatus: 'alle',
}

function App() {
  const {
    session,
    user,
    isLoading: isAuthLoading,
    error: authError,
    signIn,
    signUp,
    sendMagicLink,
    signOut,
  } = useAuth()
  const isPrivateSupabaseApp = isSupabaseConfigured
  const canLoadEntries = !isPrivateSupabaseApp || Boolean(user)
  const { entries, isReady, error, diagnostics, addEntry, updateEntry, deleteEntry } = useGameEntries(
    canLoadEntries,
    user?.id,
  )
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
  const gameOutcomes = useMemo(
    () => buildGameOutcomeSummaries(dashboardEntries),
    [dashboardEntries],
  )

  function handleSubmit(draft: GameEntryDraft) {
    if (isPrivateSupabaseApp && !session) {
      return
    }

    if (editingEntry) {
      updateEntry(editingEntry.id, draft)
      setEditingEntry(null)
      return
    }

    addEntry(draft)
  }

  if (isPrivateSupabaseApp && isAuthLoading) {
    return (
      <main className="login-shell">
        <div className="app-notice">Login wird geprüft...</div>
      </main>
    )
  }

  if (isPrivateSupabaseApp && !session) {
    return (
      <LoginPage
        error={authError}
        isLoading={isAuthLoading}
        onSendMagicLink={sendMagicLink}
        onSignIn={signIn}
        onSignUp={signUp}
      />
    )
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
            Schnelle Erfassung, bereinigte Spielnamen und private Cloud-Daten nach Login.
          </p>
        </div>
        <div className="app-header__actions">
          <div className="app-header__aside" aria-label="Speicherstatus">
            <Database aria-hidden="true" />
            <span>{isSupabaseConfigured ? 'Supabase Cloud privat' : 'localStorage aktiv'}</span>
            <small>{isReady ? `${entries.length} Einträge geladen` : 'Daten werden geladen...'}</small>
          </div>
          {isSupabaseConfigured ? (
            <Button onClick={signOut} title="Abmelden" variant="secondary">
              <LogOut data-icon="inline-start" />
              Abmelden
            </Button>
          ) : null}
        </div>
      </header>

      {error ? <div className="app-alert">{error}</div> : null}
      {isReady && !error && isSupabaseConfigured && entries.length === 0 ? (
        <div className="app-alert">
          Supabase ist verbunden, aber für diesen Login wurden 0 Einträge geladen. Prüfe, ob die
          Einträge die richtige <code>user_id</code> haben und ob die RLS-Policy den angemeldeten Nutzer zulässt.
        </div>
      ) : null}
      {isReady && !isSupabaseConfigured ? (
        <div className="app-alert">
          Supabase ist in diesem Build nicht konfiguriert. Prüfe in Vercel die Production-Variablen
          <code>VITE_SUPABASE_URL</code> und <code>VITE_SUPABASE_ANON_KEY</code> und löse danach ein Redeploy aus.
        </div>
      ) : null}

      <details className="diagnostics-panel" aria-label="Datenlade-Diagnose">
        <summary>Datenlade-Diagnose</summary>
        <div className="diagnostics-panel__content">
          <div><strong>Supabase verbunden:</strong> {diagnostics.isSupabaseConfigured ? 'ja' : 'nein'}</div>
          <div><strong>Login aktiv:</strong> {diagnostics.isLoginActive ? 'ja' : 'nein'}</div>
          <div><strong>Angemeldet:</strong> {session ? 'ja' : 'nein'}</div>
          <div><strong>Datenquelle:</strong> {diagnostics.source}</div>
          <div><strong>Geladene Einträge:</strong> {entries.length}</div>
          <div><strong>Rohdatensätze aus Supabase/localStorage:</strong> {diagnostics.rawRowCount ?? 'unbekannt'}</div>
          <div><strong>Letzter Ladefehler/RLS-Meldung:</strong> {diagnostics.lastError ?? 'keiner'}</div>
          <details>
            <summary>Erster Rohdatensatz</summary>
            <pre>{diagnostics.firstRawRow ? JSON.stringify(diagnostics.firstRawRow, null, 2) : 'kein Rohdatensatz geladen'}</pre>
          </details>
        </div>
      </details>

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
          <GameOutcomePanel outcomes={gameOutcomes} />
        </div>

        <aside className="workspace__side">
          <GameEntryForm
            editingEntry={editingEntry}
            existingGameNames={gameNames}
            knownPlayerNames={players}
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
