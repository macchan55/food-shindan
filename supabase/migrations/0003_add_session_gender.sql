-- Lets a user pick which character-art gender set (male/female) their result reveal uses.
-- Nullable: older sessions and anyone who skips the picker fall back to the single default
-- image in diagnosis_types.image_url (see src/lib/diagnosis/serialize.ts).
alter table diagnosis_sessions add column gender text check (gender in ('male', 'female'));
