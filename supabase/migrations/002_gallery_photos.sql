-- ===========================================================================
-- 002_gallery_photos.sql
-- UGC gallery photos table + RLS
-- (Chinese comments removed: Supabase Dashboard SQL Editor mis-parses fullwidth
--  parens inside single-quoted comment strings. Schema only here.)
-- ===========================================================================

create table if not exists public.gallery_photos (
  id          uuid primary key default gen_random_uuid(),
  title       text         not null,
  author      text,
  photo_url   text         not null,
  story       text,
  taken_at    date,
  status      text         not null default 'draft'
                check (status in ('draft', 'published', 'archived')),
  created_by  uuid         references auth.users(id) on delete set null,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

create index if not exists gallery_photos_published_recent
  on public.gallery_photos (status, created_at desc);

alter table public.gallery_photos enable row level security;

drop policy if exists "gallery_photos_read_published" on public.gallery_photos;
create policy "gallery_photos_read_published"
  on public.gallery_photos
  for select
  using (status = 'published');

drop policy if exists "gallery_photos_admin_read_all" on public.gallery_photos;
create policy "gallery_photos_admin_read_all"
  on public.gallery_photos
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin_ops', 'super_admin')
    )
  );

drop policy if exists "gallery_photos_admin_write" on public.gallery_photos;
create policy "gallery_photos_admin_write"
  on public.gallery_photos
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin_ops', 'super_admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin_ops', 'super_admin')
    )
  );
