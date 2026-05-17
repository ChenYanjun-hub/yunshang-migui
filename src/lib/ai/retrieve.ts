/**
 * RAG 检索：query 文本 → embedding → match_archives → topK 史料
 * 仅 server 侧调用（chat route handler / server actions）
 */

import { createClient } from '@supabase/supabase-js';
import { embed } from './embed';

export type RetrievedArchive = {
  archive_id: string;
  title: string;
  era: string;
  category: string;
  year: number | null;
  description: string | null;
  source: string | null;
  author: string | null;
  cover_url: string | null;
  similarity: number;
};

export type RetrieveOptions = {
  /** 返回 topK，默认 6 */
  count?: number;
  /** cosine 相似度阈值，默认 0.40（实测 0.30 会让脱题 query 硬召回噪声） */
  threshold?: number;
};

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * 对 query 做 embed，调 match_archives RPC 取 topK 史料
 */
export async function retrieveArchives(
  query: string,
  opts: RetrieveOptions = {},
): Promise<RetrievedArchive[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const queryEmbedding = await embed(trimmed);

  const sb = getServiceClient();
  const { data, error } = await sb.rpc('match_archives', {
    query_embedding: queryEmbedding,
    match_threshold: opts.threshold ?? 0.40,
    match_count: opts.count ?? 6,
  });

  if (error) throw new Error(`match_archives RPC failed: ${error.message}`);
  return (data ?? []) as RetrievedArchive[];
}

/**
 * 按 archive id 直接取一条已发布史料，shape 与 retrieveArchives 对齐。
 * 用于 anchor 场景：用户从某史料 Lightbox 进入 AI 对话，必须保证该史料置顶。
 */
export async function fetchArchiveById(id: string): Promise<RetrievedArchive | null> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from('archives')
    .select('id, title, era, category, year, description, source, author, cover_url, status')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    console.error('[retrieve] fetchArchiveById failed:', error.message);
    return null;
  }
  if (!data) return null;

  return {
    archive_id: data.id,
    title: data.title,
    era: data.era,
    category: data.category,
    year: data.year,
    description: data.description,
    source: data.source,
    author: data.author,
    cover_url: data.cover_url,
    similarity: 1, // anchor 命中视为完美匹配
  };
}
