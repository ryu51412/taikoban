-- 太鼓判くん 初期スキーマ
-- Supabase の SQL Editor で実行するか、`supabase db push` で適用してください。

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- stores
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  name text not null,
  mark text,
  google_review_url text not null default '',
  aspects text[] not null default '{}',   -- 決め手の選択肢（3つ）
  menus text[] not null default '{}',     -- おすすめメニュー（3つ）
  coupon_text text,                        -- 特典メッセージ（回答した全員に表示）
  notify_email text not null default '',
  status text not null default '準備中' check (status in ('公開中','準備中','未発行')),
  plan text not null default 'ライト' check (plan in ('スタンダード','ライト')),
  notify_on boolean not null default true,
  coupon_on boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('operator','owner')),
  store_id uuid references public.stores(id) on delete set null
);

-- ---------------------------------------------------------------- events（集計の元データ。1回の来店 = 1 session_id）
create table if not exists public.events (
  id bigserial primary key,
  store_id uuid not null references public.stores(id) on delete cascade,
  session_id uuid not null,
  type text not null check (type in ('qr_open','star','aspect','menu','post_click','feedback_submit')),
  rating int check (rating between 1 and 5),
  value text check (char_length(value) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists events_store_time on public.events (store_id, created_at);

-- ---------------------------------------------------------------- responses（「届いたご意見」の1件）
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  session_id uuid not null,
  rating int not null check (rating between 1 and 5),
  route text not null check (route in ('google','form')),
  tags text[] not null default '{}',
  text text not null default '' check (char_length(text) <= 4000),
  done boolean not null default false,
  created_at timestamptz not null default now(),
  unique (store_id, session_id, route)
);
create index if not exists responses_store_time on public.responses (store_id, created_at desc);

-- ---------------------------------------------------------------- Row Level Security
-- アプリはサーバー側で service role を使い、権限はアプリで確認します。
-- 以下は anon / authenticated キーで直接触られた場合の二重の守りです。
alter table public.stores enable row level security;
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.responses enable row level security;

create or replace function public.tk_is_operator() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'operator');
$$;
create or replace function public.tk_my_store() returns uuid
language sql stable security definer set search_path = public as $$
  select store_id from profiles where id = auth.uid();
$$;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid() or tk_is_operator());

drop policy if exists "stores read" on public.stores;
create policy "stores read" on public.stores for select to authenticated using (tk_is_operator() or id = tk_my_store());
drop policy if exists "stores write" on public.stores;
create policy "stores write" on public.stores for update to authenticated using (tk_is_operator() or id = tk_my_store()) with check (tk_is_operator() or id = tk_my_store());
drop policy if exists "stores insert" on public.stores;
create policy "stores insert" on public.stores for insert to authenticated with check (tk_is_operator());

drop policy if exists "events read" on public.events;
create policy "events read" on public.events for select to authenticated using (tk_is_operator() or store_id = tk_my_store());

drop policy if exists "responses read" on public.responses;
create policy "responses read" on public.responses for select to authenticated using (tk_is_operator() or store_id = tk_my_store());
drop policy if exists "responses update" on public.responses;
create policy "responses update" on public.responses for update to authenticated using (tk_is_operator() or store_id = tk_my_store()) with check (tk_is_operator() or store_id = tk_my_store());

-- ---------------------------------------------------------------- 集計（アプリの src/lib/stats.ts computeStats と同じ定義）
-- taps     : 期間内に qr_open したセッション数
-- starred  : 期間内に ★ を付けたセッション数（ratings はセッションごとの最後の★）
-- weekly   : p_week_from から7日ごと10本、hours: 日本時間 [11–14, 14–17, 17–20, 20–23, その他]
create or replace function public.tk_store_stats(
  p_from timestamptz, p_to timestamptz, p_prev_from timestamptz, p_week_from timestamptz, p_store uuid default null
) returns table (
  store_id uuid, taps int, prev_taps int, starred int, aspected int, posted int, feedback int,
  ratings int[], prev_starred int, prev_rating_sum int, weekly int[], hours int[]
)
language sql stable security definer set search_path = public as $$
  with ev as (
    select e.store_id, e.session_id, e.type, e.rating, e.created_at
    from events e
    where e.created_at >= least(p_prev_from, p_week_from) and e.created_at < p_to
      and (p_store is null or e.store_id = p_store)
  ),
  cur as (select * from ev where created_at >= p_from),
  counts as (
    select c.store_id,
      count(distinct c.session_id) filter (where c.type = 'qr_open')::int as taps,
      count(distinct c.session_id) filter (where c.type = 'aspect')::int as aspected,
      count(distinct c.session_id) filter (where c.type = 'post_click')::int as posted,
      count(*) filter (where c.type = 'feedback_submit')::int as feedback
    from cur c group by c.store_id
  ),
  cur_r as (
    select distinct on (c.store_id, c.session_id) c.store_id, c.rating
    from cur c where c.type = 'star' and c.rating between 1 and 5
    order by c.store_id, c.session_id, c.created_at desc
  ),
  rd as (
    select r.store_id, count(*)::int as starred,
      array[count(*) filter (where r.rating = 1), count(*) filter (where r.rating = 2), count(*) filter (where r.rating = 3),
            count(*) filter (where r.rating = 4), count(*) filter (where r.rating = 5)]::int[] as ratings
    from cur_r r group by r.store_id
  ),
  prev as (select * from ev where created_at >= p_prev_from and created_at < p_from),
  prev_c as (select p.store_id, count(distinct p.session_id)::int as prev_taps from prev p where p.type = 'qr_open' group by p.store_id),
  prev_r as (
    select distinct on (p.store_id, p.session_id) p.store_id, p.rating
    from prev p where p.type = 'star' and p.rating between 1 and 5
    order by p.store_id, p.session_id, p.created_at desc
  ),
  prd as (select r.store_id, count(*)::int as prev_starred, sum(r.rating)::int as prev_rating_sum from prev_r r group by r.store_id),
  wk as (
    select w.store_id, floor(extract(epoch from (w.created_at - p_week_from)) / 604800)::int as b, count(distinct w.session_id)::int as n
    from ev w where w.type = 'qr_open' and w.created_at >= p_week_from group by 1, 2
  ),
  hr as (
    select x.store_id,
      case when x.h >= 11 and x.h < 14 then 0 when x.h >= 14 and x.h < 17 then 1 when x.h >= 17 and x.h < 20 then 2 when x.h >= 20 and x.h < 23 then 3 else 4 end as b,
      count(distinct x.session_id)::int as n
    from (select c.store_id, c.session_id, extract(hour from c.created_at at time zone 'Asia/Tokyo')::int as h from cur c where c.type = 'qr_open') x
    group by 1, 2
  )
  select s.id,
    coalesce(c.taps, 0), coalesce(pc.prev_taps, 0), coalesce(rd.starred, 0), coalesce(c.aspected, 0), coalesce(c.posted, 0), coalesce(c.feedback, 0),
    coalesce(rd.ratings, array[0,0,0,0,0]::int[]), coalesce(prd.prev_starred, 0), coalesce(prd.prev_rating_sum, 0),
    array(select coalesce((select n from wk where wk.store_id = s.id and wk.b = g), 0) from generate_series(0, 9) g),
    array(select coalesce((select n from hr where hr.store_id = s.id and hr.b = g), 0) from generate_series(0, 4) g)
  from stores s
  left join counts c on c.store_id = s.id
  left join rd on rd.store_id = s.id
  left join prev_c pc on pc.store_id = s.id
  left join prd on prd.store_id = s.id
  where p_store is null or s.id = p_store
  order by s.created_at;
$$;

create or replace function public.tk_open_response_counts() returns table (store_id uuid, n int)
language sql stable security definer set search_path = public as $$
  select r.store_id, count(*)::int from responses r where not r.done group by r.store_id;
$$;

-- 集計関数はサーバー（service role）からだけ呼ぶ
revoke execute on function public.tk_store_stats(timestamptz, timestamptz, timestamptz, timestamptz, uuid) from public, anon, authenticated;
revoke execute on function public.tk_open_response_counts() from public, anon, authenticated;
grant execute on function public.tk_store_stats(timestamptz, timestamptz, timestamptz, timestamptz, uuid) to service_role;
grant execute on function public.tk_open_response_counts() to service_role;
