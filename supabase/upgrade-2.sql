-- 「你有資格生下一代嗎？」資料庫升級（第 2 版）
-- 用法：Supabase → SQL Editor → New query → 整段貼上 → Run。可以重複執行，不會刪掉資料。
-- 1. 統計改由資料庫算好再傳（每次只傳幾 KB，不會因為人多就用完免費流量）
-- 2. 防灌資料：同一個連線位址 10 分鐘內最多新增 20 筆；位址只存雜湊值，24 小時後刪除

-- ---------- 統計快取 ----------
create table if not exists public.stats_cache (
  id int primary key,
  at timestamptz not null,
  payload jsonb not null
);
alter table public.stats_cache enable row level security;
revoke all on table public.stats_cache from anon, authenticated;

-- 實際計算統計（示範資料：真實分享未滿 20 筆時才計入）
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
    select (data->>'th')::numeric as th, data->>'county' as county
    from used where jsonb_typeof(data->'th') = 'number'
  ), hist as (
    select least(100, greatest(0, floor(th)))::int as b, count(*) as c from ths group by 1
  ), pc as (
    select (data->>'perChild')::numeric as v
    from used where jsonb_typeof(data->'perChild') = 'number' and (data->>'perChild')::numeric > 0
  ), by_county as (
    select county, count(*) as n, percentile_cont(0.5) within group (order by th) as med
    from ths where county is not null group by county
  )
  select jsonb_build_object(
    'n', (select count(*) from used),
    'realN', (select real_n from cnt),
    'demoN', (select demo_n from cnt),
    'demoOn', (select demo_n > 0 and real_n < 20 from cnt),
    'by', coalesce((select jsonb_object_agg(key, m) from by_key), '{}'::jsonb),
    'thHist', (select jsonb_agg(coalesce(h.c, 0) order by g) from generate_series(0, 100) g left join hist h on h.b = g),
    'thMedian', (select percentile_cont(0.5) within group (order by th) from ths),
    'perChildMedian', (select percentile_cont(0.5) within group (order by v) from pc),
    'byCounty', coalesce((select jsonb_object_agg(county, jsonb_build_object('n', n, 'med', med)) from by_county), '{}'::jsonb)
  );
$$;
revoke all on function public.compute_stats() from public, anon, authenticated;

-- 網頁讀統計：最多每 30 秒重算一次；p_id 只用來回答「這台裝置有沒有分享過」
create or replace function public.crowd_stats(p_id text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  c public.stats_cache%rowtype;
  p jsonb;
begin
  select * into c from public.stats_cache where id = 1;
  if not found or c.at < now() - interval '30 seconds' then
    p := public.compute_stats();
    insert into public.stats_cache (id, at, payload) values (1, now(), p)
    on conflict (id) do update set at = excluded.at, payload = excluded.payload;
  else
    p := c.payload;
  end if;
  return p || jsonb_build_object('mine', p_id is not null and exists (select 1 from public.submissions where id = p_id));
end;
$$;
grant execute on function public.crowd_stats(text) to anon, authenticated;

-- ---------- 防灌資料 ----------
create table if not exists public.rate_log (
  ip_hash text not null,
  at timestamptz not null default now()
);
create index if not exists rate_log_ip_at on public.rate_log (ip_hash, at);
alter table public.rate_log enable row level security;
revoke all on table public.rate_log from anon, authenticated;

-- 送出或更新（新增的部分：新代號要先通過頻率限制；有人送出後讓統計快取在 10 秒內更新）
create or replace function public.submit_choice(p_id text, p_secret text, p_data jsonb)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  h text;
  ip text;
  iph text;
  is_new boolean;
  ok boolean;
begin
  if p_id is null or p_id !~ '^[a-z0-9]{16,40}$' then raise exception 'bad id'; end if;
  if p_secret is null or length(p_secret) < 20 or length(p_secret) > 80 then raise exception 'bad secret'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or octet_length(p_data::text) > 3000 then raise exception 'bad data'; end if;
  if coalesce(p_data->>'v', '') <> '2' then raise exception 'bad version'; end if;
  h := encode(sha256(convert_to(p_secret, 'UTF8')), 'hex');
  is_new := not exists (select 1 from public.submissions where id = p_id);
  if is_new then
    begin
      ip := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1);
    exception when others then ip := '';
    end;
    if ip <> '' then
      iph := encode(sha256(convert_to('next-gen:' || trim(ip), 'UTF8')), 'hex');
      delete from public.rate_log where at < now() - interval '24 hours';
      if (select count(*) from public.rate_log where ip_hash = iph and at > now() - interval '10 minutes') >= 20 then
        raise exception 'rate limited';
      end if;
      insert into public.rate_log (ip_hash) values (iph);
    end if;
  end if;
  insert into public.submissions (id, secret_hash, data)
  values (p_id, h, p_data)
  on conflict (id) do update
    set data = excluded.data, updated_at = now()
    where public.submissions.secret_hash = excluded.secret_hash;
  ok := found;  -- 先記下來：後面的 update 會改掉 found
  if ok then
    update public.stats_cache set at = '-infinity' where id = 1 and at < now() - interval '10 seconds';
  end if;
  return ok;
end;
$$;
grant execute on function public.submit_choice(text, text, jsonb) to anon, authenticated;

-- 取消分享後也讓統計更新
create or replace function public.withdraw_choice(p_id text, p_secret text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from public.submissions
  where id = p_id and secret_hash = encode(sha256(convert_to(coalesce(p_secret, ''), 'UTF8')), 'hex');
  if found then
    update public.stats_cache set at = '-infinity' where id = 1;
    return true;
  end if;
  return false;
end;
$$;
grant execute on function public.withdraw_choice(text, text) to anon, authenticated;

-- ---------- 意見與回報 ----------
-- 玩家在網站上寫的意見只有你看得到（Table Editor → feedback），不會公開
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null,          -- calc 計算有誤／data 資料有誤或過時／bug 畫面或操作／idea 建議／other 其他
  message text not null,
  context jsonb,               -- 玩家勾選時附上的設定（縣市、各題選擇、收入 PR 區間），方便重現問題
  page text                    -- 從哪一頁送出
);
alter table public.feedback enable row level security;
revoke all on table public.feedback from anon, authenticated;

create or replace function public.submit_feedback(p_kind text, p_message text, p_context jsonb default null, p_page text default null)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  ip text;
  iph text;
  msg text := btrim(coalesce(p_message, ''));
begin
  if p_kind is null or p_kind not in ('calc', 'data', 'bug', 'idea', 'other') then raise exception 'bad kind'; end if;
  if char_length(msg) < 2 or char_length(msg) > 1000 then raise exception 'bad message'; end if;
  if p_context is not null and (jsonb_typeof(p_context) <> 'object' or octet_length(p_context::text) > 3000) then raise exception 'bad context'; end if;
  if p_page is not null and char_length(p_page) > 40 then raise exception 'bad page'; end if;
  -- 同一個連線位址 10 分鐘內最多 5 則（只存雜湊值，24 小時後刪除）
  begin
    ip := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1);
  exception when others then ip := '';
  end;
  if ip <> '' then
    iph := encode(sha256(convert_to('next-gen-feedback:' || trim(ip), 'UTF8')), 'hex');
    delete from public.rate_log where at < now() - interval '24 hours';
    if (select count(*) from public.rate_log where ip_hash = iph and at > now() - interval '10 minutes') >= 5 then
      raise exception 'rate limited';
    end if;
    insert into public.rate_log (ip_hash) values (iph);
  end if;
  insert into public.feedback (kind, message, context, page) values (p_kind, msg, p_context, p_page);
  return true;
end;
$$;
grant execute on function public.submit_feedback(text, text, jsonb, text) to anon, authenticated;
