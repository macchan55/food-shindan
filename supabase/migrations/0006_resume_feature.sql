-- Sprint 2: resume-builder feature (docs/spec/03-mvp-overview.md sections 18-21).
-- Adds account-scoped tables for profile, education, work history, qualifications, and
-- the AI-assisted resume/work-history document content. diagnosis_sessions.user_id
-- (added in 0001_init.sql, unused until now) is what links a completed diagnosis to the
-- account created at "履歴書を作る".
--
-- All app access continues to go through Next.js Route Handlers using the service-role
-- key (see 0001_init.sql's note on RLS); the policies below are defense-in-depth for the
-- day browser code talks to these tables directly.

create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  full_name_kana text,
  birthdate date,
  gender text,
  postal_code text,
  address text,
  phone text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table education_histories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  school_type text not null, -- 高校 / 専門学校 / 短大 / 大学 / 大学院 etc.
  school_name text not null,
  department text,
  is_culinary_related boolean not null default false, -- 調理・製菓・ホテル系専門教育
  is_study_abroad boolean not null default false,
  admission_date date,
  graduation_date date,
  status text not null default 'graduated' check (status in ('graduated', 'withdrew', 'enrolled')),
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table work_experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  brand_name text,
  store_name text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  employment_type text, -- 正社員 / 契約社員 / アルバイト 等
  business_format text, -- 業態
  cuisine_genre text, -- 料理ジャンル
  job_type text, -- 職種
  position text, -- 役職
  store_size text,
  seat_count int,
  avg_spend int,
  managed_headcount int,
  main_duties text,
  achievements text,
  reason_for_leaving text,
  reason_visibility text not null default 'private' check (reason_visibility in ('private', 'public')),
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table user_qualifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, -- from a master list client-side, but stored free-text (spec allows 自由入力)
  issuer text,
  obtained_date date,
  expiry_date date,
  certificate_number text,
  image_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- One row per user: the editable, AI-assisted text shared by both document templates.
create table resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  diagnosis_session_id uuid references diagnosis_sessions(id) on delete set null,
  target_job text,
  work_summary text,
  self_pr text,
  strengths_text text,
  motivation text,
  career_direction text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_profiles enable row level security;
alter table education_histories enable row level security;
alter table work_experiences enable row level security;
alter table user_qualifications enable row level security;
alter table resumes enable row level security;

create policy "own profile" on user_profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "own education" on education_histories for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own work experience" on work_experiences for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own qualifications" on user_qualifications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own resume" on resumes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Photo storage for the 履歴書 template. Uploads go through our API using the
-- service-role client (never a direct browser upload), so the bucket itself can be public
-- read — object paths are per-user UUIDs, not guessable/listable.
insert into storage.buckets (id, name, public)
values ('resume-photos', 'resume-photos', true)
on conflict (id) do nothing;
