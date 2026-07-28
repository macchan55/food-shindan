-- 席数・管理人数・客単価は履歴書上は「何席〜何席」のような範囲表記が自然なため、
-- 数値カラムから範囲ラベルを保持できる text カラムに変更する。
-- 既存の数値データはテキスト表現に変換して保持する（破壊的変更ではない）。
alter table work_experiences
  alter column seat_count type text using seat_count::text,
  alter column avg_spend type text using avg_spend::text,
  alter column managed_headcount type text using managed_headcount::text;
