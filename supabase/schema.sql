-- 나의 디지털 기운 읽기 — 2차 기능(모임 익명 집계)용 스키마
-- Supabase SQL Editor 에서 한 번 실행한다.
-- 응답에는 세 오행 값만 저장하며 이름·이메일·전화번호 등 개인 식별정보는 수집하지 않는다.

create table if not exists workshop_sessions (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{2,63}$'),
  title text not null,
  organization text,
  event_date date,
  is_open boolean default true,
  created_at timestamptz default now()
);

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references workshop_sessions(id) on delete cascade,
  self_element text not null check (self_element in ('water','wood','fire','earth','metal')),
  borrow_element text not null check (borrow_element in ('water','wood','fire','earth','metal')),
  community_element text not null check (community_element in ('water','wood','fire','earth','metal')),
  created_at timestamptz default now()
);

create index if not exists responses_session_idx on responses(session_id);

-- 익명 사용자(anon)는 테이블을 직접 읽거나 쓰지 못하고, 아래 두 함수만 호출할 수 있다.
alter table workshop_sessions enable row level security;
alter table responses enable row level security;
revoke all on workshop_sessions, responses from anon, authenticated;

-- 응답 추가: 열려 있는 세션에만 저장된다.
create or replace function add_response(p_session text, p_self text, p_borrow text, p_community text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from workshop_sessions where id = p_session and is_open) then
    raise exception '열려 있는 모임 세션을 찾을 수 없습니다.';
  end if;
  insert into responses(session_id, self_element, borrow_element, community_element)
  values (p_session, p_self, p_borrow, p_community);
end;
$$;

-- 모임 집계: 개별 응답 대신 오행별 개수만 돌려주며, 3명 미만이면 분포를 숨긴다.
create or replace function group_summary(p_session text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with s as (select * from workshop_sessions where id = p_session),
       r as (select * from responses where session_id = p_session),
       n as (select count(*)::int as total from r)
  select case when not exists (select 1 from s) then null else json_build_object(
    'session_id', (select id from s),
    'title', (select title from s),
    'is_open', (select is_open from s),
    'total', (select total from n),
    'self', case when (select total from n) >= 3 then
      (select json_object_agg(self_element, c) from (select self_element, count(*) c from r group by 1) t) end,
    'borrow', case when (select total from n) >= 3 then
      (select json_object_agg(borrow_element, c) from (select borrow_element, count(*) c from r group by 1) t) end,
    'community', case when (select total from n) >= 3 then
      (select json_object_agg(community_element, c) from (select community_element, count(*) c from r group by 1) t) end
  ) end;
$$;

grant execute on function add_response(text, text, text, text) to anon;
grant execute on function group_summary(text) to anon;

-- 관리자용(SQL Editor에서 실행): 세션 생성 / 종료 예시
-- insert into workshop_sessions(id, title, organization, event_date)
--   values ('bingo-seoul-20261002', '빈고 경인권 조합원 모임', '공동체은행 빈고', '2026-10-02');
-- update workshop_sessions set is_open = false where id = 'bingo-seoul-20261002';
