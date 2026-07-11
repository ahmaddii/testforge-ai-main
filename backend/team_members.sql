-- Run this in Supabase SQL editor before using Team Access.
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  member_id uuid null,
  email text not null,
  role text not null default 'Member',
  status text not null default 'pending',
  invited_by uuid not null,
  accepted_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists team_members_owner_idx on public.team_members(owner_id);
create index if not exists team_members_member_idx on public.team_members(member_id);
create index if not exists team_members_email_idx on public.team_members(email);
