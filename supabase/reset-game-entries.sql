-- Sichere Bereinigung der alten Beispieldaten.
-- Bitte zuerst den SELECT-Block ausführen und prüfen, ob wirklich nur die alten Demo-Zeilen angezeigt werden.

select id, spiel_name, datum, anzahl_runden, mitspieler, gewonnen, notiz, user_id
from public.game_entries
where id in (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000004'
)
or (
  user_id is null
  and (spiel_name, datum, anzahl_runden, gewonnen) in (
    ('Monopoly Deal', date '2026-01-01', 3, 2),
    ('Skull', date '2026-01-02', 3, 2),
    ('Doppelkopf', date '2026-01-02', 5, 4),
    ('Bomb Busters', date '2026-01-03', 10, 8)
  )
);

-- Erst ausführen, wenn die SELECT-Ausgabe korrekt ist.
delete from public.game_entries
where id in (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000004'
)
or (
  user_id is null
  and (spiel_name, datum, anzahl_runden, gewonnen) in (
    ('Monopoly Deal', date '2026-01-01', 3, 2),
    ('Skull', date '2026-01-02', 3, 2),
    ('Doppelkopf', date '2026-01-02', 5, 4),
    ('Bomb Busters', date '2026-01-03', 10, 8)
  )
);

