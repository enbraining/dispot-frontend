create table servers (
  id uuid primary key default gen_random_uuid(),
  guild_id text unique,                          -- Discord 서버 ID
  name text not null default '',
  description text not null default '',
  invite_url text,                               -- 봇이 자동 관리
  icon_url text,
  tags text[] not null default '{}',
  member_count integer not null default 0,       -- 봇이 자동 동기화
  bump_count integer not null default 0,
  bumped_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  owner_id uuid references auth.users(id) on delete set null,
  nsfw boolean not null default false,
  bot_added boolean not null default false       -- 봇이 서버에 있는지 여부
);

create index on servers (bumped_at desc);
create index on servers (member_count desc);
create index on servers (created_at desc);
create index on servers (bot_added);

-- Bump function
create or replace function bump_server(server_id uuid)
returns void language plpgsql as $$
begin
  update servers
  set bump_count = bump_count + 1,
      bumped_at = now()
  where id = server_id;
end;
$$;

-- RLS
alter table servers enable row level security;
create policy "anyone can read bot_added servers" on servers for select using (bot_added = true);
create policy "service role can do anything" on servers using (true) with check (true);
