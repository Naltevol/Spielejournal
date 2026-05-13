# Spielejournal

Moderne React/TypeScript-App zum Erfassen und Auswerten gespielter Gesellschaftsspiele.

## Funktionen

- Einträge hinzufügen, bearbeiten und löschen
- Tabelle mit Suche und Filtern nach Jahr, Spiel, Mitspieler und Gewinnstatus
- Dashboard-Kennzahlen für gespielte Runden, unterschiedliche Spiele, Top-Spiel, Top-Mitspieler und Gewinnquote
- Recharts-Diagramme für Spiele, Mitspieler und gewonnen/verloren
- CSV-Export mit Semikolon-Trennung und UTF-8-BOM für Excel
- Browser-Speicherung über `localStorage`
- Optional Supabase Cloud-Speicherung für geräteübergreifende Nutzung

## Starten

Wenn `pnpm` installiert ist:

```bash
pnpm install
pnpm dev
```

In dieser Codex-Umgebung liegt zusätzlich ein lokaler pnpm-Runner im Projekt:

```bash
./.tools/pnpm11 install
./.tools/pnpm11 dev
```

Die App läuft danach unter `http://localhost:5173`.

## Supabase aktivieren

1. Erstelle ein Supabase-Projekt.
2. Öffne im Supabase-Dashboard den SQL Editor.
3. Führe den Inhalt aus `supabase/schema.sql` aus.
4. Kopiere `.env.example` nach `.env.local`.
5. Trage deine Supabase Project URL und den anon public key ein.
6. Starte die App neu.

```bash
cp .env.example .env.local
pnpm dev
```

Wenn `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` gesetzt sind, nutzt die App automatisch Supabase. Ohne diese Werte fällt sie auf `localStorage` zurück.

Hinweis: Das SQL-Schema enthält öffentliche anon-Policies, damit die App ohne Login geräteübergreifend funktioniert. Für eine öffentlich gehostete App solltest du später Supabase Auth ergänzen und die Policies auf den angemeldeten Nutzer einschränken.

Die Datenschicht liegt in `src/storage/gameEntryRepository.ts`. Dort sind `LocalStorageGameEntryRepository` und `SupabaseGameEntryRepository` austauschbar hinter derselben Schnittstelle gekapselt.

## Deployment auf Vercel

Die App ist als Vite Single Page App für Vercel vorbereitet. Die Datei `vercel.json` setzt:

- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: `vite`

### 1. Supabase vorbereiten

1. Öffne dein Supabase-Projekt.
2. Gehe zum SQL Editor.
3. Führe den Inhalt von `supabase/schema.sql` aus.
4. Öffne in Supabase `Project Settings` > `API`.
5. Kopiere die `Project URL`.
6. Kopiere den `anon public` API Key.

Wichtig: Es wird noch kein Login verwendet. Das aktuelle SQL-Schema erlaubt deshalb Zugriff über den anon key, damit du die App direkt auf dem iPhone testen kannst.

### 2. Projekt zu GitHub hochladen

Vercel deployt am einfachsten aus einem GitHub-Repository:

```bash
git init
git add .
git commit -m "Prepare Spielejournal for Vercel"
```

Danach das Repository bei GitHub erstellen und den lokalen Ordner dorthin pushen.

### 3. Projekt in Vercel importieren

1. Öffne `https://vercel.com/new`.
2. Wähle dein GitHub-Repository aus.
3. Vercel sollte das Projekt als Vite-App erkennen.
4. Prüfe die Build Settings:
   - Framework Preset: `Vite`
   - Install Command: `npm ci`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 4. Environment Variables in Vercel eintragen

In Vercel unter `Project Settings` > `Environment Variables` diese Werte anlegen:

```bash
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-public-key
```

Setze beide Variablen mindestens für `Production`. Für Test-Deployments kannst du zusätzlich `Preview` und `Development` auswählen.

### 5. Deployen und auf dem iPhone öffnen

1. Starte das Deployment in Vercel.
2. Öffne nach erfolgreichem Build die Vercel-URL auf dem iPhone.
3. Lege einen Testeintrag an.
4. Öffne dieselbe URL auf einem zweiten Gerät. Der Eintrag sollte dort ebenfalls sichtbar sein, sobald Supabase korrekt verbunden ist.

Wenn die App oben rechts `Supabase Cloud aktiv` anzeigt, wurden die Environment Variables erkannt. Wenn dort `localStorage aktiv` steht, fehlen die Variablen im aktuellen Vercel Environment oder das Deployment wurde nach dem Eintragen noch nicht neu gestartet.
