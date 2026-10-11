-- 「你有資格生下一代嗎？」的資料庫設定
-- 用法：Supabase 專案 → 左側 SQL Editor → New query → 整段貼上 → 按 Run
-- 可以重複執行（不會刪掉已經收集到的資料）

-- 1. 存放玩家選擇的表格
create table if not exists public.submissions (
  id          text primary key,              -- 瀏覽器隨機產生的匿名代號
  secret_hash text not null,                 -- 只有那台裝置知道的密語（只存雜湊），用來更新或取消分享
  data        jsonb not null,                -- 玩家的選擇（縣市、幾個孩子、住法……），不含姓名或收入金額
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. 鎖住表格：網頁不能直接讀寫，只能透過下面三個函式
alter table public.submissions enable row level security;
revoke all on table public.submissions from anon, authenticated;

-- 3. 送出或更新自己的選擇
create or replace function public.submit_choice(p_id text, p_secret text, p_data jsonb)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  h text;
begin
  if p_id is null or p_id !~ '^[a-z0-9]{16,40}$' then raise exception 'bad id'; end if;
  if p_secret is null or length(p_secret) < 20 or length(p_secret) > 80 then raise exception 'bad secret'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or octet_length(p_data::text) > 3000 then raise exception 'bad data'; end if;
  if coalesce(p_data->>'v', '') <> '2' then raise exception 'bad version'; end if;
  h := encode(sha256(convert_to(p_secret, 'UTF8')), 'hex');
  insert into public.submissions (id, secret_hash, data)
  values (p_id, h, p_data)
  on conflict (id) do update
    set data = excluded.data, updated_at = now()
    where public.submissions.secret_hash = excluded.secret_hash;
  return found;
end;
$$;

-- 4. 取消分享：刪掉自己的那一筆
create or replace function public.withdraw_choice(p_id text, p_secret text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from public.submissions
  where id = p_id and secret_hash = encode(sha256(convert_to(coalesce(p_secret, ''), 'UTF8')), 'hex');
  return found;
end;
$$;

-- 5. 讀取最近的選擇（給「大家怎麼選」的統計用；不會讀到密語）
create or replace function public.list_choices(p_limit int default 2000)
returns setof jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select s.data || jsonb_build_object('_id', s.id)
  from public.submissions s
  order by s.updated_at desc
  limit least(greatest(coalesce(p_limit, 2000), 1), 5000);
$$;

-- 6. 開放這三個函式給網頁使用
grant execute on function public.submit_choice(text, text, jsonb) to anon, authenticated;
grant execute on function public.withdraw_choice(text, text) to anon, authenticated;
grant execute on function public.list_choices(int) to anon, authenticated;
