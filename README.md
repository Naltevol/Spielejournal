# Spielejournal

Moderne React/TypeScript-App zum Erfassen und Auswerten gespielter Gesellschaftsspiele. Die Cloud-Version nutzt aktuell öffentliche Supabase-Policies, damit die App ohne Login nutzbar ist.

## Funktionen

- Öffentliche Supabase-Nutzung ohne Login
- Einträge hinzufügen, bearbeiten und löschen
- Tabelle mit Suche und Filtern nach Jahr, Monat, Mitspieler und Gewinnstatus
- Dashboard-Kennzahlen für gespielte Runden, unterschiedliche Spiele, Top-Spiel, Top-Mitspieler und Gewinnquote
- Recharts-Diagramme für Spiele, Mitspieler und gewonnen/verloren
- CSV-Export mit Semikolon-Trennung und UTF-8-BOM für Excel
- Spielnamen-Aliasse und Fuzzy-Hinweise im Formular
- Lokaler Fallback über `localStorage`, wenn keine Supabase-Variablen gesetzt sind

## Starten

```bash
npm install
npm run dev
```

Die App läuft danach unter `http://localhost:5173` oder dem von Vite angezeigten Port.

## Supabase einrichten

1. Erstelle ein Supabase-Projekt.
2. Öffne im Supabase-Dashboard den SQL Editor.
3. Führe den Inhalt aus `supabase/schema.sql` aus.
4. Kopiere `.env.example` nach `.env.local`.
5. Trage deine Supabase Project URL und den anon public key ein.
6. Starte die App neu.

```bash
cp .env.example .env.local
npm run dev
```

Die App nutzt Supabase automatisch öffentlich, sobald `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` gesetzt sind. Ohne diese Werte fällt sie auf `localStorage` zurück.

## Öffentliche Supabase-Nutzung

Die App ist aktuell ohne Login nutzbar. Dafür erlaubt `supabase/schema.sql` öffentlichen Zugriff über den anon key auf `game_entries`:

- Lesen: alle Einträge
- Erstellen: alle Einträge
- Bearbeiten: alle Einträge
- Löschen: alle Einträge

Das ist bewusst einfach für den privaten Spielejournal-Betrieb, aber nicht als Schutz für öffentliche, sensible Daten gedacht.

## Beispieldaten in Supabase löschen

Die Datei `supabase/reset-game-entries.sql` löscht nicht blind alle Daten. Sie enthält zuerst einen `SELECT`, mit dem du prüfst, welche alten Demo-Zeilen betroffen sind.

Vorgehen:

1. Supabase SQL Editor öffnen.
2. Den `SELECT` aus `supabase/reset-game-entries.sql` ausführen.
3. Prüfen, ob nur die alten Beispielzeilen angezeigt werden.
4. Erst danach den `DELETE`-Block aus derselben Datei ausführen.

## Daten importieren

Die Importdatei liegt unter:

```text
data/import/spielejournal-2026.csv
```

Format:

```csv
spielName;datum;anzahlRunden;mitspieler;gewonnen;notiz
Bomb Busters;2026-01-03;10;Nele, Lennart, Lukas, Eila;8;Teamspiel
```

Vor dem Import muss dein Supabase-Nutzer existieren. Ergänze in `.env.local` zusätzlich:

```bash
SUPABASE_IMPORT_EMAIL=deine-email@example.com
SUPABASE_IMPORT_PASSWORD=dein-passwort
```

Dann importieren:

```bash
npm run import:games
```

Oder mit einem eigenen CSV-Pfad:

```bash
npm run build:import
node scripts-dist/scripts/import-game-entries.js data/import/spielejournal-2026.csv
```

Der Import ist idempotent. Er erzeugt keine Duplikate, wenn er mehrfach ausgeführt wird. Das Duplikat-Kriterium ist:

```text
Spielname + Datum + Häufigkeit + Mitspieler + Gewonnen
```

Spielnamen und Mitspieler werden beim Import normalisiert. Bekannte doppelte Mitspieler werden für Altdaten aufgelöst: ein zweiter `Lennart` wird als `Lennart S.` geführt, eine zweite `Lena` als `Lena B.`. Neue Einträge sollten doppelte Namen direkt mit Kürzel unterscheiden.

## Spielnamen-Normalisierung

Die zentrale Alias-Logik liegt in `src/domain/gameAliases.ts`. Aktuell werden unter anderem zusammengeführt:

- `BombBusters`, `Bomb Busters` -> `Bomb Busters`
- `Flip7`, `Flip 7` -> `Flip 7`
- `GAP`, `Gap`, `Gab` -> `GAP`
- `Lovecraft Letter`, `LoveCraftLetter`, `Lovekraft Letter` -> `Lovecraft Letter`
- `Sea, Salt und Paper`, `Sea, Salt & Paper` -> `Sea, Salt & Paper`
- `Qouridor`, `Quoridor` -> `Quoridor`
- `Siedler`, `Siedler von Catan` -> `Siedler von Catan`
- `Poesie`, `Poesie für Neandertaler` -> `Poesie für Neandertaler`

Im Formular erscheint bei ähnlichen Schreibweisen ein Hinweis wie `Meintest du Bomb Busters?`.

## Auswertungslogik

- Gesamtzahl gespielter Runden: Summe aus `anzahlRunden`
- Anzahl Spiele: unterschiedliche normalisierte Spielnamen
- Häufigstes Spiel: Spiel mit den meisten Runden
- Häufigster Mitspieler: Person mit den meisten Mitspieler-Runden
- Gewinnquote: `gewonnen / anzahlRunden`
- Gewonnen/verloren: numerische Rundenzählung; Teamspiel-Texte gehören in `notiz`
- Jahres- und Monatsfilter wirken auf Dashboard, Diagramme und Tabelle

## Deployment auf Vercel

Die App ist als Vite Single Page App für Vercel vorbereitet. `vercel.json` setzt:

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: `vite`

### Environment Variables in Vercel

In Vercel unter `Project Settings` > `Environment Variables` diese Werte anlegen:

```bash
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-public-key
```

Setze beide Variablen mindestens für `Production`. Für Test-Deployments kannst du zusätzlich `Preview` und `Development` auswählen.

## Sicherheit

Nicht committen:

- `.env.local`
- `node_modules`
- `dist`
- `scripts-dist`

Keine Supabase Secret Keys verwenden. Die App und das Importskript nutzen den anon public key.
