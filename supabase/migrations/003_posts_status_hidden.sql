-- ===========================================================================
-- 003_posts_status_hidden.sql
-- Extend posts.status CHECK to allow 'hidden' (admin soft-hide)
-- visible | hidden two states. User side still sees only visible;
-- admin backend sees all.
-- ===========================================================================

alter table public.posts drop constraint if exists posts_status_check;

alter table public.posts
  add constraint posts_status_check
  check (status in ('visible', 'hidden'));

create index if not exists posts_status_created_idx
  on public.posts (status, created_at desc);
