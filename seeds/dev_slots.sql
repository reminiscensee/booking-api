WITH generated_slots AS (
  SELECT
    (ts AT TIME ZONE 'Europe/Kyiv') AS starts_at
  FROM generate_series(0, 4) AS day_offset,
  generate_series(
    (NOW() AT TIME ZONE 'Europe/Kyiv')::date + day_offset + TIME '10:00',
    (NOW() AT TIME ZONE 'Europe/Kyiv')::date + day_offset + TIME '17:30',
    INTERVAL '30 minutes'
  ) AS ts
)
INSERT INTO time_slots (starts_at, ends_at)
SELECT
  starts_at,
  starts_at + INTERVAL '30 minutes'
FROM generated_slots
ON CONFLICT (starts_at) DO NOTHING;
