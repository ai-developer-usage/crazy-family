-- ===========================================================================
-- Crazy Family — Supabase schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query →
-- paste this whole file → Run. Safe to re-run (uses IF NOT EXISTS / OR REPLACE).
-- ===========================================================================

-- ── People table ──────────────────────────────────────────────────────────
create table if not exists public.people (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  last_name   text not null default '',
  gender      text not null default 'other'
              check (gender in ('male', 'female', 'other')),
  photo_url   text,
  birth_date  date,
  death_date  date,
  birth_place text,
  bio         text,
  -- Canonical relationships. Siblings & children are DERIVED in the app, never
  -- stored, so the data can't contradict itself.
  father_id   uuid references public.people (id) on delete set null,
  mother_id   uuid references public.people (id) on delete set null,
  spouse_ids  uuid[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists people_father_idx on public.people (father_id);
create index if not exists people_mother_idx on public.people (mother_id);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists people_touch_updated_at on public.people;
create trigger people_touch_updated_at
  before update on public.people
  for each row execute function public.touch_updated_at();

-- ── Row Level Security ─────────────────────────────────────────────────────
-- Anyone (even logged-out visitors) can VIEW the family tree.
-- Only authenticated users can add / edit / delete.
alter table public.people enable row level security;

drop policy if exists "people are viewable by everyone" on public.people;
create policy "people are viewable by everyone"
  on public.people for select
  using (true);

drop policy if exists "authenticated can insert people" on public.people;
create policy "authenticated can insert people"
  on public.people for insert to authenticated
  with check (true);

drop policy if exists "authenticated can update people" on public.people;
create policy "authenticated can update people"
  on public.people for update to authenticated
  using (true) with check (true);

drop policy if exists "authenticated can delete people" on public.people;
create policy "authenticated can delete people"
  on public.people for delete to authenticated
  using (true);

-- ── Photo storage bucket ───────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photos are public" on storage.objects;
create policy "photos are public"
  on storage.objects for select
  using (bucket_id = 'photos');

drop policy if exists "authenticated can upload photos" on storage.objects;
create policy "authenticated can upload photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos');

drop policy if exists "authenticated can update photos" on storage.objects;
create policy "authenticated can update photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'photos');

drop policy if exists "authenticated can delete photos" on storage.objects;
create policy "authenticated can delete photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos');
