-- ===========================================================================
-- 002_gallery_photos.sql
-- 用户作品（UGC）影像表 + RLS
--
-- 与 public.archives 的关系：
--   - archives 装"官方收录的史料"（照片/文献/地图/图纸/报刊/口述）
--   - gallery_photos 装"用户投稿的影像"（仅照片，附作者署名 + 创作故事）
--   - 不混用 archives 表，避免污染 RAG 向量检索（archives_embeddings 仅
--     索引 archives）
--
-- 跑法：粘贴到 Supabase Dashboard → SQL Editor → Run
-- ===========================================================================

create table if not exists public.gallery_photos (
  id          uuid primary key default gen_random_uuid(),
  title       text         not null,
  author      text,                -- 摄影/作者署名（演示期 admin 代填）
  photo_url   text         not null,
  story       text,                -- 创作故事 / 拍摄背景
  taken_at    date,                -- 拍摄日期（可选）
  status      text         not null default 'draft'
                check (status in ('draft', 'published', 'archived')),
  created_by  uuid         references auth.users(id) on delete set null,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

comment on table public.gallery_photos is
  '用户作品影像（UGC）。Exhibition User Gallery 区域的数据源。演示期 admin 代为录入。';

create index if not exists gallery_photos_published_recent
  on public.gallery_photos (status, created_at desc);

-- RLS：开启 + 分两类策略
alter table public.gallery_photos enable row level security;

-- 1) 公开读：仅 published 行
drop policy if exists "gallery_photos_read_published" on public.gallery_photos;
create policy "gallery_photos_read_published"
  on public.gallery_photos
  for select
  using (status = 'published');

-- 2) 管理读：admin_ops / super_admin 可见全部行（含 draft / archived）
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

-- 3) 管理写：admin_ops / super_admin 可 insert / update / delete
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
