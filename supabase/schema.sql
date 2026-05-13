create extension if not exists pgcrypto;

create table if not exists public.game_entries (
  id uuid primary key default gen_random_uuid(),
  spiel_name text not null,
  datum date not null,
  anzahl_runden integer not null check (anzahl_runden > 0),
  mitspieler text[] not null default '{}',
  gewonnen integer not null default 0 check (gewonnen >= 0),
  notiz text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_entries_wins_lte_rounds check (gewonnen <= anzahl_runden)
);

create index if not exists game_entries_datum_idx on public.game_entries (datum desc);
create index if not exists game_entries_spiel_name_idx on public.game_entries (spiel_name);
create index if not exists game_entries_mitspieler_idx on public.game_entries using gin (mitspieler);

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

create policy "game_entries_select_public"
on public.game_entries
for select
to anon
using (true);

create policy "game_entries_insert_public"
on public.game_entries
for insert
to anon
with check (true);

create policy "game_entries_update_public"
on public.game_entries
for update
to anon
using (true)
with check (true);

create policy "game_entries_delete_public"
on public.game_entries
for delete
to anon
using (true);

insert into public.game_entries
  (id, spiel_name, datum, anzahl_runden, mitspieler, gewonnen, notiz)
values
  ('00000000-0000-4000-8000-000000000001', 'Monopoly Deal', '2026-01-01', 3, array['Nele'], 2, null),
  ('00000000-0000-4000-8000-000000000002', 'Skull', '2026-01-02', 3, array['Nele', 'Lennart', 'Lukas'], 2, null),
  ('00000000-0000-4000-8000-000000000003', 'Doppelkopf', '2026-01-02', 5, array['Nele', 'Lennart', 'Lukas'], 4, null),
  ('00000000-0000-4000-8000-000000000004', 'Bomb Busters', '2026-01-03', 10, array['Nele', 'Lennart', 'Lukas', 'Eila'], 8, 'Teamspiel')
on conflict (id) do nothing;
