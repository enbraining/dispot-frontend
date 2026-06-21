create table servers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  invite_url text not null,
  icon_url text,
  category text not null,
  tags text[] not null default '{}',
  member_count integer not null default 0,
  bump_count integer not null default 0,
  bumped_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  owner_id uuid references auth.users(id) on delete set null,
  nsfw boolean not null default false
);

create index on servers (bumped_at desc);
create index on servers (member_count desc);
create index on servers (created_at desc);
create index on servers (category);

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
create policy "anyone can read" on servers for select using (true);
create policy "anyone can insert" on servers for insert with check (true);
create policy "owner can update" on servers for update using (auth.uid() = owner_id);
create policy "owner can delete" on servers for delete using (auth.uid() = owner_id);
