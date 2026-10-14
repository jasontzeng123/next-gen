-- 「你有資格生下一代嗎？」資料庫升級（第 3 版）
-- 用法：Supabase → SQL Editor → New query → 整段貼上 → Run。可以重複執行，不會刪掉資料。
-- 內容：門檻統計改成用「同齡、不分產業」的 PR 來比較。
--   門檻 PR 原本是跟同齡、同產業的人比；不同產業的薪資差很多（半導體業的 PR 28 ≈ 不分產業的 PR 70），
--   放在一起算中位數會失真。這裡把每筆分享的門檻換算成同一把尺，舊資料也一起補上。
-- 換算方式和網頁裡的 ENGINE.thAllPR() 相同；數字取自 src/data.js（薪資分布與各產業中位數）。

-- ---------- 1. 換算用的函式 ----------
-- 收入 PR → 相對於中位數的倍數（PR 90 以下對數內插，以上用 Pareto 尾端）
create or replace function public.tw_wage_ratio(p double precision)
returns double precision
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  xs double precision[] := array[1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  ys double precision[] := array[0.42, 0.53, 0.6044, 0.6978, 0.7912, 0.8919, 1, 1.1502, 1.3791, 1.7564, 2.4469];
  i int;
begin
  p := greatest(0.5, least(99.9, p));
  if p > xs[array_length(xs, 1)] then
    return ys[array_length(ys, 1)] * power(0.10 / (1 - p / 100), 1 / 2.8::double precision);
  end if;
  if p <= xs[1] then return ys[1]; end if;
  for i in 2..array_length(xs, 1) loop
    if p <= xs[i] then
      return exp(ln(ys[i - 1]) + (ln(ys[i]) - ln(ys[i - 1])) * (p - xs[i - 1]) / (xs[i] - xs[i - 1]));
    end if;
  end loop;
  return ys[array_length(ys, 1)];
end;
$$;

-- 倍數 → 收入 PR（上面函式的反函數）
create or replace function public.tw_wage_ratio_inv(r double precision)
returns double precision
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  xs double precision[] := array[1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  ys double precision[] := array[0.42, 0.53, 0.6044, 0.6978, 0.7912, 0.8919, 1, 1.1502, 1.3791, 1.7564, 2.4469];
  n int := array_length(xs, 1);
  i int;
begin
  if r <= ys[1] then return 0.5; end if;
  if r > ys[n] then
    return least(99.9, 100 * (1 - 0.10 * power(ys[n] / r, 2.8::double precision)));
  end if;
  for i in 2..n loop
    if r <= ys[i] then
      return xs[i - 1] + (ln(r) - ln(ys[i - 1])) / (ln(ys[i]) - ln(ys[i - 1])) * (xs[i] - xs[i - 1]);
    end if;
  end loop;
  return xs[n];
end;
$$;

-- 一筆分享資料的門檻 → 同齡、不分產業的 PR
create or replace function public.tw_th_all(d jsonb)
returns double precision
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  th double precision;
  r double precision;
  spread constant double precision := 0.85;
  med_all constant double precision := 590000;
  k_all constant double precision := 1;
  tot double precision := 0;
  n int := 0;
  other boolean := false;
  v_id text;
  v_med double precision;
  v_k double precision;
begin
  if d is null or jsonb_typeof(d->'th') is distinct from 'number' then return null; end if;
  th := (d->>'th')::double precision;
  if th >= 100 then return 100; end if;
  if d->>'county' is not null and d->>'county' not in ('TPE', 'NTPC', 'TYN', 'TXG', 'TNN', 'KHH', 'HSZ', 'HSQ', 'KEE', 'ILA', 'MIA', 'CHA', 'NAN', 'YUN', 'CYI', 'CYQ', 'PIF', 'HUA', 'TTT', 'PEN', 'KIN', 'LIE') then return th; end if;
  r := public.tw_wage_ratio(th);
  foreach v_id in array array[
    case when coalesce(d->>'incomeMode', '') <> 'thresholdB' then d->>'indA' end,
    case when coalesce(d->>'partner', '') = 'true' then d->>'indB' end
  ] loop
    if v_id is null then continue; end if;
    v_med := null; v_k := null;
    select t.med, t.k into v_med, v_k from (values
      ('all', 590000, 1),
      ('fin', 1194000, 0.85),
      ('semi', 946000, 0.85),
      ('comp', 971000, 0.85),
      ('ict', 872000, 0.85),
      ('power', 1178000, 0.6),
      ('prof', 756000, 0.85),
      ('health', 734000, 0.9),
      ('transport', 719000, 0.8),
      ('mfg', 616000, 0.85),
      ('realestate', 629000, 0.9),
      ('retail', 593000, 0.85),
      ('construction', 564000, 0.8),
      ('water', 545000, 0.75),
      ('arts', 471000, 0.85),
      ('support', 448000, 0.8),
      ('food', 448000, 0.8),
      ('edu', 413000, 0.85),
      ('other', 411000, 0.85),
      ('civil', 820000, 0.4),
      ('teacher', 860000, 0.35),
      ('none', 0, 0)
    ) as t(id, med, k) where t.id = v_id;
    if v_med is null or v_med <= 0 then continue; end if;
    tot := tot + v_med * power(r, v_k * spread);
    n := n + 1;
    if v_id <> 'all' then other := true; end if;
  end loop;
  if n = 0 or not other then return th; end if;
  return public.tw_wage_ratio_inv(power(tot / n / med_all, 1 / (k_all * spread)));
end;
$$;

-- 這些函式只給資料庫內部使用，網頁不能直接呼叫
revoke all on function public.tw_wage_ratio(double precision) from public, anon, authenticated;
revoke all on function public.tw_wage_ratio_inv(double precision) from public, anon, authenticated;
revoke all on function public.tw_th_all(jsonb) from public, anon, authenticated;

-- ---------- 2. 舊資料補上換算後的門檻 ----------
-- 新版網頁送出時就會附上 thAll；這裡只補還沒有的舊資料
update public.submissions
set data = data || jsonb_build_object('thAll', round(public.tw_th_all(data)::numeric, 1))
where jsonb_typeof(data->'th') = 'number' and not (data ? 'thAll');

-- ---------- 3. 統計多回傳換算後的門檻分布 ----------
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
    'byCountyAll', coalesce((select jsonb_object_agg(county, jsonb_build_object('n', n, 'med', med)) from by_county_all), '{}'::jsonb)
  );
$$;

-- ---------- 4. 讓統計馬上重算 ----------
update public.stats_cache set at = '-infinity' where id = 1;
