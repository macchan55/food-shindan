-- Scenes 13-20 originally had only 2 questions each (vs. 4 for scenes 1-12), which made
-- the per-scene title-card interstitial (added right before this migration) fire twice as
-- often in the back half of the quiz and feel obnoxious. Merges each adjacent pair of
-- 2-question scenes into a single 4-question scene, matching the pacing of scenes 1-12 and
-- taking the total scene count from 20 down to 16. Purely a scene_id/scene_title relabel —
-- question content, choices, scores, and display_order are untouched, so scoring is
-- unaffected. Source of truth updated in scripts/seed-data/questions.json (regenerates
-- supabase/seed.sql) to keep this in sync for any future fresh-DB seed.

update questions set scene_id = 13, scene_title = 'どこに賭ける？'
  where question_code in ('Q49', 'Q50', 'Q51', 'Q52')
  and version_id in (select id from diagnosis_versions where is_active = true);

update questions set scene_id = 14, scene_title = '評価とプレッシャー、どう受け止める？'
  where question_code in ('Q53', 'Q54', 'Q55', 'Q56')
  and version_id in (select id from diagnosis_versions where is_active = true);

update questions set scene_id = 15, scene_title = '目指す景色はどっち？'
  where question_code in ('Q57', 'Q58', 'Q59', 'Q60')
  and version_id in (select id from diagnosis_versions where is_active = true);

update questions set scene_id = 16, scene_title = '問題が起きたとき、どう動く？'
  where question_code in ('Q61', 'Q62', 'Q63', 'Q64')
  and version_id in (select id from diagnosis_versions where is_active = true);
