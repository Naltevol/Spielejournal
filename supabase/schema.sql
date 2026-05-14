create extension if not exists pgcrypto;

create table if not exists public.game_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  spiel_name text not null,
  datum date not null,
  anzahl_runden integer not null check (anzahl_runden > 0),
  mitspieler text[] not null default '{}',
  gewonnen integer not null default 0 check (gewonnen >= 0),
  notiz text,
  import_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_entries_wins_lte_rounds check (gewonnen <= anzahl_runden)
);

alter table public.game_entries add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.game_entries add column if not exists import_key text;
alter table public.game_entries alter column user_id set default auth.uid();

create index if not exists game_entries_user_datum_idx on public.game_entries (user_id, datum desc);
create index if not exists game_entries_user_spiel_name_idx on public.game_entries (user_id, spiel_name);
create index if not exists game_entries_user_mitspieler_idx on public.game_entries using gin (mitspieler);
create unique index if not exists game_entries_user_import_key_idx
  on public.game_entries (user_id, import_key);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_game_entries_updated_at on public.game_entries;

create trigger set_game_entries_updated_at
before update on public.game_entries
for each row
execute function public.set_updated_at();

alter table public.game_entries enable row level security;

drop policy if exists "game_entries_select_public" on public.game_entries;
drop policy if exists "game_entries_insert_public" on public.game_entries;
drop policy if exists "game_entries_update_public" on public.game_entries;
drop policy if exists "game_entries_delete_public" on public.game_entries;
drop policy if exists "game_entries_select_own" on public.game_entries;
drop policy if exists "game_entries_insert_own" on public.game_entries;
drop policy if exists "game_entries_update_own" on public.game_entries;
drop policy if exists "game_entries_delete_own" on public.game_entries;

create policy "game_entries_select_public"
on public.game_entries
for select
to anon, authenticated
using (true);

create policy "game_entries_insert_public"
on public.game_entries
for insert
to anon, authenticated
with check (true);

create policy "game_entries_update_public"
on public.game_entries
for update
to anon, authenticated
using (true)
with check (true);

create policy "game_entries_delete_public"
on public.game_entries
for delete
to anon, authenticated
using (true);

-- Die App ist aktuell öffentlich: anon und authenticated dürfen alle Einträge lesen, erstellen, bearbeiten und löschen.

