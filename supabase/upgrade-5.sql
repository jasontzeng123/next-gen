-- 「你有資格生下一代嗎？」資料庫升級（第 5 版）
-- 用法：Supabase → SQL Editor → New query → 整段貼上 → Run。可以重複執行，不會刪掉資料。
-- 內容：統計多回傳「標準門檻（存款以同齡平均計）」的分布（thTyp）。
--   標準門檻只看養育標準本身：存款換成同齡平均存款（依主計總處各年齡平均儲蓄推估）、家人資助當成 0、收入不分產業。
--   新版網頁送出分享時會附上 thTyp；舊的分享由作者另外產生的補算檔補上（含各筆時間戳記，不放進公開的程式庫）。
--   網頁在大部分分享都有 thTyp 之後，統計才會改用它。

create or replace function public.compute_stats()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with base as (
    select data from public.submissions where data->>'v' = '2'
  ), cnt as (
    select count(*) filter (where coalesce(data->>'demo', '') <> 'true') as real_n,
           count(*) filter (where data->>'demo' = 'true') as demo_n
    from base
  ), used as (
    select b.data from base b, cnt where coalesce(b.data->>'demo', '') <> 'true' or cnt.real_n < 20
  ), kv as (
    select e.key, e.value #>> '{}' as val
    from used, jsonb_each(used.data) e
    where e.key = any (array['county','district','partner','kids','spacing','room','housing','buyWhen','build','loan','reno','postpartum','leave','care','quitUntil','preschool','school','after','cram','uni','uniAway','support','transport','lifestyle','travel','elder','elderCare','incomeMode','ageBand','birthAge','verdict'])
      and jsonb_typeof(e.value) in ('string', 'number', 'boolean')
  ), by_key as (
    select key, jsonb_object_agg(val, c) as m
    from (select key, val, count(*) as c from kv group by key, val) t
    group by key
  ), ths as (
    select (data->>'th')::numeric as th,
           coalesce(case when jsonb_typeof(data->'thAll') = 'number' then (data->>'thAll')::numeric end,
                    public.tw_th_all(data)::numeric) as tha,
           data->>'county' as county
    from used where jsonb_typeof(data->'th') = 'number'
  ), hist as (
    select least(100, greatest(0, floor(th)))::int as b, count(*) as c from ths group by 1
  ), hist_all as (
    select least(100, greatest(0, floor(tha)))::int as b, count(*) as c from ths where tha is not null group by 1
  ), pc as (
    select (data->>'perChild')::numeric as v
    from used where jsonb_typeof(data->'perChild') = 'number' and (data->>'perChild')::numeric > 0
  ), by_county as (
    select county, count(*) as n, percentile_cont(0.5) within group (order by th) as med
    from ths where county is not null group by county
  ), stds as (
    select (data->>'thStd')::numeric as v, data->>'county' as county
    from used where jsonb_typeof(data->'thStd') = 'number'
  ), hist_std as (
    select least(100, greatest(0, floor(v)))::int as b, count(*) as c from stds group by 1
  ), by_county_std as (
    select county, count(*) as n, percentile_cont(0.5) within group (order by v) as med
    from stds where county is not null group by county
  ), typs as (
    select (data->>'thTyp')::numeric as v, data->>'county' as county
    from used where jsonb_typeof(data->'thTyp') = 'number'
  ), hist_typ as (
    select least(100, greatest(0, floor(v)))::int as b, count(*) as c from typs group by 1
  ), by_county_typ as (
    select county, count(*) as n, percentile_cont(0.5) within group (order by v) as med
    from typs where county is not null group by county
  ), by_county_all as (
    select county, count(*) as n, percentile_cont(0.5) within group (order by tha) as med
    from ths where county is not null and tha is not null group by county
  )
  select jsonb_build_object(
    'n', (select count(*) from used),
    'realN', (select real_n from cnt),
    'demoN', (select demo_n from cnt),
    'demoOn', (select demo_n > 0 and real_n < 20 from cnt),
    'by', coalesce((select jsonb_object_agg(key, m) from by_key), '{}'::jsonb),
    'thHist', (select jsonb_agg(coalesce(h.c, 0) order by g) from generate_series(0, 100) g left join hist h on h.b = g),
    'thMedian', (select percentile_cont(0.5) within group (order by th) from ths),
    'thAllHist', (select jsonb_agg(coalesce(h.c, 0) order by g) from generate_series(0, 100) g left join hist_all h on h.b = g),
    'thAllMedian', (select percentile_cont(0.5) within group (order by tha) from ths where tha is not null),
    'perChildMedian', (select percentile_cont(0.5) within group (order by v) from pc),
    'byCounty', coalesce((select jsonb_object_agg(county, jsonb_build_object('n', n, 'med', med)) from by_county), '{}'::jsonb),
    'byCountyAll', coalesce((select jsonb_object_agg(county, jsonb_build_object('n', n, 'med', med)) from by_county_all), '{}'::jsonb),
    'stdN', (select count(*) from stds),
    'stdHist', (select jsonb_agg(coalesce(h.c, 0) order by g) from generate_series(0, 100) g left join hist_std h on h.b = g),
    'stdMedian', (select percentile_cont(0.5) within group (order by v) from stds),
    'byCountyStd', coalesce((select jsonb_object_agg(county, jsonb_build_object('n', n, 'med', med)) from by_county_std), '{}'::jsonb),
    'typN', (select count(*) from typs),
    'typHist', (select jsonb_agg(coalesce(h.c, 0) order by g) from generate_series(0, 100) g left join hist_typ h on h.b = g),
    'typMedian', (select percentile_cont(0.5) within group (order by v) from typs),
    'byCountyTyp', coalesce((select jsonb_object_agg(county, jsonb_build_object('n', n, 'med', med)) from by_county_typ), '{}'::jsonb)
  );
$$;

-- 讓統計馬上重算
update public.stats_cache set at = '-infinity' where id = 1;
