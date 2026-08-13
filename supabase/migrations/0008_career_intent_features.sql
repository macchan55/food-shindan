-- Career-intent features: preference capture at signup, gated job listings (JSTARs
-- partner feed), behavior-based intent scoring, tag-based work history, and optional
-- paid add-on interest capture. See conversation for the product brief (10-point list).

-- ① no paywall anywhere in this schema — resumes/PDF stay free; only ⑩ addon_requests
-- below is an *optional* upsell, never a gate.

-- ②③ desired conditions, captured right after signup (5 pulldown items).
create table career_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  -- timing intentionally includes 'if_good_offer' so passive/currently-not-looking
  -- craftspeople still register instead of bouncing at a forced "今すぐ/3ヶ月/半年" choice.
  timing text not null check (
    timing in ('immediately', 'within_3_months', 'within_6_months', 'if_good_offer', 'not_yet')
  ),
  desired_income text,
  desired_area text,
  desired_format text,
  desired_role text,
  change_reasons text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ④ job postings teaser + gating. Sample/placeholder rows only below — real JSTARs feed
-- ingestion is a separate integration task (API access / data contract not available yet).
create table job_postings (
  id uuid primary key default gen_random_uuid(),
  partner text not null default 'jstars',
  store_name text not null,
  is_michelin boolean not null default false,
  area text,
  business_format text,
  role text,
  annual_income_min int,
  annual_income_max int,
  -- Shown to everyone, including anonymous visitors, without revealing store_name.
  summary text not null,
  -- true = 非公開求人: store_name/details only unlock via a job_interview_requests row.
  -- false = still requires registration to appear in the full list, but name shows right
  -- after registration with no interview step.
  is_confidential boolean not null default true,
  status text not null default 'open' check (status in ('open', 'closed')),
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table job_interview_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_posting_id uuid not null references job_postings(id) on delete cascade,
  status text not null default 'requested' check (
    status in ('requested', 'scheduled', 'done', 'cancelled')
  ),
  created_at timestamptz not null default now(),
  unique (user_id, job_posting_id)
);

-- ⑤ intent scoring: append-only event log (not a denormalized counter) so the scoring
-- weights can be re-tuned later by recomputing from history instead of backfilling a column.
create table intent_score_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (
    event_type in ('registered', 'preferences_submitted', 'interview_requested', 'addon_requested')
  ),
  points int not null,
  created_at timestamptz not null default now()
);

create view user_intent_scores as
  select user_id, coalesce(sum(points), 0)::int as score
  from intent_score_events
  group by user_id;

-- ⑥⑦ tag-based work history entry. business_format (already a column since 0006's
-- work_experiences table — dropped from the UI at the time, but never from the schema)
-- drives which tag set/granularity the UI renders (see src/lib/resume/workTags.ts);
-- station/skill tags replace prose for anyone who picks a format with a curated tag
-- catalog, and free text (main_duties/achievements, already present) remains the
-- fallback for 'その他' / freeform formats.
alter table work_experiences add column station_tags text[] not null default '{}';
alter table work_experiences add column skill_tags text[] not null default '{}';

-- ⑧ lets the resume flow start from 職歴 instead of 学歴 (education has no bearing on
-- suitability in this industry) without needing two separate route trees.
alter table resumes add column entry_order text not null default 'education_first'
  check (entry_order in ('education_first', 'work_first'));

-- ⑩ optional paid add-ons (添削・面接対策・多言語代行). Interest capture only — no payment
-- processing here; follow-up/billing happens off-platform for now.
create table addon_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  addon_type text not null check (addon_type in ('resume_review', 'interview_prep', 'translation')),
  note text,
  status text not null default 'requested' check (status in ('requested', 'contacted', 'done')),
  created_at timestamptz not null default now()
);

alter table career_preferences enable row level security;
alter table job_postings enable row level security;
alter table job_interview_requests enable row level security;
alter table intent_score_events enable row level security;
alter table addon_requests enable row level security;

create policy "own career preferences" on career_preferences for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "open postings are readable" on job_postings for select
  using (status = 'open');
create policy "own interview requests" on job_interview_requests for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own addon requests" on addon_requests for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- intent_score_events: no browser-facing policy — written/read only via the service-role
-- server routes, same posture as diagnosis scoring tables.

-- Placeholder JSTARs sample listings so the teaser/gating UI is demonstrable before the
-- real partner feed exists. Replace/delete once real data is wired up.
insert into job_postings
  (store_name, is_michelin, area, business_format, role, annual_income_min, annual_income_max, summary, is_confidential, display_order)
values
  ('(非公開)', true, '東京都港区', '和食・寿司', '料理長候補', 6000000, 9000000,
   'ミシュラン一つ星の和食店。将来の料理長候補を募集。少人数体制で裁量大きめ。', true, 1),
  ('(非公開)', true, '東京都中央区', 'フレンチ', 'スーシェフ', 5500000, 8000000,
   'ミシュラン星付きフレンチ。海外研修制度あり、独立支援実績も豊富。', true, 2),
  ('(非公開)', false, '大阪府大阪市', '焼鳥', '店長', 4500000, 6000000,
   '人気焼鳥チェーンの新店舗立ち上げ店長候補。将来的なエリアマネージャー登用あり。', false, 3);
