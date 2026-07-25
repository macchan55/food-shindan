-- Adds character portrait images to the 64 diagnosis types (see public/characters/).
alter table diagnosis_types add column image_url text;

-- Backfill: deterministic from type_code, matches the public/characters/<TypeCode>.webp
-- filenames written by scripts/art/optimize-and-place.mjs. No-op on a fresh install where
-- diagnosis_types is still empty at this point (seed.sql runs after migrations).
update diagnosis_types set image_url = '/characters/' || type_code || '.webp';
