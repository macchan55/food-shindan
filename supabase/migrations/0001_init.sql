-- Restaurant DNA - Sprint 1 schema
-- Anonymous diagnosis flow: questions -> choices -> choice_scores (master data),
-- diagnosis_sessions -> diagnosis_answers -> diagnosis_scores -> diagnosis_results (per-user data).
--
-- All application access to these tables goes through Next.js Route Handlers using the
-- Supabase *service role* key (server-only). RLS is enabled with no policies, so the
-- anon/public key (used nowhere against these tables today) cannot read or write anything.
-- This keeps Sprint 1 simple; Sprint 2+ can add scoped RLS policies once user auth exists.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Diagnosis master data (edited from the admin panel in Sprint 2+, DB-driven from day 1)
-- ---------------------------------------------------------------------------

create table diagnosis_versions (
  id uuid primary key default gen_random_uuid(),
  version_label text not null unique, -- e.g. 'v2.0'
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references diagnosis_versions(id) on delete cascade,
  question_code text not null, -- Q01..Q64
  scene_id int not null,
  scene_title text not null,
  visual_brief text,
  display_order int not null,
  question_text text not null,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (version_id, question_code)
);
create index questions_version_order_idx on questions (version_id, display_order);

create table choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  choice_code text not null check (choice_code in ('A', 'B', 'C', 'D')),
  choice_text text not null,
  display_order int not null,
  created_at timestamptz not null default now(),
  unique (question_id, choice_code)
);
create index choices_question_idx on choices (question_id, display_order);

create table choice_scores (
  id uuid primary key default gen_random_uuid(),
  choice_id uuid not null references choices(id) on delete cascade,
  axis_code text not null, -- HOS, CRA, TEA, LEA, BUS, CRE, GRO, STA, CHA, OWN, EMP, RES, DAT, CUS
  score_value int not null,
  unique (choice_id, axis_code)
);
create index choice_scores_choice_idx on choice_scores (choice_id);

-- 64 Restaurant DNA types. tag_axis1..6 are the six binary judgment axes
-- (Guest/Product, Craft/Business, High-end/Mass, Specialist/Leader, Arrange/Venture,
-- Intuitive/Data) derived from the 10+4 core scores at result time; see docs/spec/00-axes.md.
create table diagnosis_types (
  id uuid primary key default gen_random_uuid(),
  type_code text not null unique, -- T01..T64
  name text not null,
  catchcopy text not null,
  description text not null,
  family text not null,
  primary_archetype text,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  suited_jobs text[] not null default '{}',
  suited_formats text[] not null default '{}',
  suited_roles text[] not null default '{}',
  tag_axis1 text not null,
  tag_axis2 text not null,
  tag_axis3 text not null,
  tag_axis4 text not null,
  tag_axis5 text not null,
  tag_axis6 text not null,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tag_axis1, tag_axis2, tag_axis3, tag_axis4, tag_axis5, tag_axis6)
);

-- Job / format(業態) / role master vectors, used to rank career suggestions in the result screen.
create table job_format_role_master (
  id text primary key, -- JOB-001 / GEN-041 / ROL-076 (kept from source spec)
  category text not null check (category in ('job', 'format', 'role')),
  name text not null,
  vector jsonb not null, -- {"HOS": 90, "CRA": 45, ...} over the 10 core axes
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index job_format_role_master_category_idx on job_format_role_master (category);

-- ---------------------------------------------------------------------------
-- Per-user diagnosis data
-- ---------------------------------------------------------------------------

create table diagnosis_sessions (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references diagnosis_versions(id),
  user_id uuid references auth.users(id) on delete set null, -- null until Sprint 2 login
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table diagnosis_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references diagnosis_sessions(id) on delete cascade,
  question_id uuid not null references questions(id),
  choice_id uuid not null references choices(id),
  answered_at timestamptz not null default now(),
  unique (session_id, question_id)
);
create index diagnosis_answers_session_idx on diagnosis_answers (session_id);

create table diagnosis_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references diagnosis_sessions(id) on delete cascade,
  axis_code text not null,
  raw_score int not null,
  max_score int not null,
  normalized_score int not null,
  unique (session_id, axis_code)
);
create index diagnosis_scores_session_idx on diagnosis_scores (session_id);

create table diagnosis_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references diagnosis_sessions(id) on delete cascade,
  type_id uuid not null references diagnosis_types(id),
  hidden_type_id uuid references diagnosis_types(id), -- 2nd-place "hidden type" when scores are close
  meta_axes jsonb not null, -- computed 6-axis winners + margins, see lib/scoring.ts
  industry_fit_score int not null,
  industry_fit_tier text not null check (industry_fit_tier in ('high', 'mid', 'low')),
  career_ranking jsonb not null default '[]',
  format_ranking jsonb not null default '[]',
  role_ranking jsonb not null default '[]',
  feedback_rating text check (
    feedback_rating is null or feedback_rating in (
      'very_accurate', 'somewhat_accurate', 'neutral', 'somewhat_inaccurate', 'very_inaccurate'
    )
  ),
  feedback_comment text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS: enabled everywhere, no policies. All access is via server-side service role.
-- ---------------------------------------------------------------------------

alter table diagnosis_versions enable row level security;
alter table questions enable row level security;
alter table choices enable row level security;
alter table choice_scores enable row level security;
alter table diagnosis_types enable row level security;
alter table job_format_role_master enable row level security;
alter table diagnosis_sessions enable row level security;
alter table diagnosis_answers enable row level security;
alter table diagnosis_scores enable row level security;
alter table diagnosis_results enable row level security;
