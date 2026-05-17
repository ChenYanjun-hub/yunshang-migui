-- ===========================================================================
-- 001_archives_embeddings.sql
-- pgvector + archives_embeddings 表 + match_archives() 检索函数
--
-- 适用：DashScope text-embedding-v3，1024 维，cosine 相似度
-- 粒度：每条 archive 整体作为一个 chunk（archive_id 唯一）
-- 跑法：粘贴到 Supabase Dashboard → SQL Editor → Run
-- ===========================================================================

-- 1. 启用 pgvector
create extension if not exists vector;

-- 2. embeddings 表
create table if not exists public.archives_embeddings (
  archive_id      uuid primary key references public.archives(id) on delete cascade,
  embedding       vector(1024) not null,
  chunk_text      text         not null,
  embedding_model text         not null default 'text-embedding-v3',
  token_count     int,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

comment on table public.archives_embeddings is
  '每条 archive 一行 1024 维向量（dashscope text-embedding-v3）。archive_id 作为 PK 保证幂等 upsert。';

-- 3. HNSW 索引（pgvector >= 0.5），cosine 操作符族
create index if not exists archives_embeddings_hnsw_cosine
  on public.archives_embeddings
  using hnsw (embedding vector_cosine_ops);

-- 4. RLS：开启 + 允许任意用户读（向量本身不敏感；写入走 service_role 绕过 RLS）
alter table public.archives_embeddings enable row level security;

drop policy if exists "archives_embeddings_read_all" on public.archives_embeddings;
create policy "archives_embeddings_read_all"
  on public.archives_embeddings
  for select
  using (true);

-- 5. 检索函数：cosine 相似度 + 阈值 + topK，只命中 status='published'
--    返回字段直接对应 RAG context 拼接 + 引用 UI 卡片所需
create or replace function public.match_archives(
  query_embedding vector(1024),
  match_threshold float default 0.30,
  match_count     int   default 6
)
returns table (
  archive_id  uuid,
  title       text,
  era         text,
  category    text,
  year        int,
  description text,
  source      text,
  author      text,
  cover_url   text,
  similarity  float
)
language sql
stable
as $$
  select
    a.id          as archive_id,
    a.title,
    a.era,
    a.category,
    a.year,
    a.description,
    a.source,
    a.author,
    a.cover_url,
    1 - (e.embedding <=> query_embedding) as similarity
  from public.archives_embeddings e
  join public.archives a on a.id = e.archive_id
  where a.status = 'published'
    and 1 - (e.embedding <=> query_embedding) >= match_threshold
  order by e.embedding <=> query_embedding asc
  limit match_count;
$$;

comment on function public.match_archives is
  'Cosine 相似度 topK 检索；threshold 默认 0.30（dashscope v3 中文经验值，可在调用端调）。';
