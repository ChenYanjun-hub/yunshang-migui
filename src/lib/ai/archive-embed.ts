/**
 * 单条 archive 的 embed + upsert helper
 * 给 admin actions 在 create/update 后调用，让向量库与 archives 表自动同步
 *
 * 仅 server 侧使用：依赖 SUPABASE_SERVICE_ROLE_KEY 绕过 RLS 写 archives_embeddings
 */

import { createClient } from '@supabase/supabase-js';
import { embed } from './embed';

// ---- 与 scripts/embed-archives.ts 一致的中文化映射 ----
export const ERA_LABEL: Record<string, string> = {
  construction: '修建期（1903-1910）',
  operation: '通车运营期（1910-1940）',
  republic: '民国时期（1912-1949）',
  prc: '建国后（1949-2000）',
  heritage: '遗产保护期（2000-至今）',
};

export const CATEGORY_LABEL: Record<string, string> = {
  photo: '老照片',
  document: '文献',
  map: '手绘地图',
  blueprint: '工程图纸',
  newspaper: '报刊剪报',
  oral_history: '口述历史',
};

export type ArchiveForEmbedding = {
  id: string;
  title: string;
  category: string;
  era: string;
  year: number | null;
  description: string | null;
  source: string | null;
  author: string | null;
};

/** 把 archive 行拼成用于 embed 的 chunk 文本（与一次性脚本同步） */
export function buildArchiveChunkText(a: ArchiveForEmbedding): string {
  const lines: string[] = [a.title];
  const era = ERA_LABEL[a.era] ?? a.era;
  const cat = CATEGORY_LABEL[a.category] ?? a.category;
  lines.push(`时期：${era}${a.year ? `（${a.year}年）` : ''}`);
  lines.push(`类型：${cat}`);
  if (a.description) lines.push(a.description);
  if (a.source) lines.push(`来源：${a.source}`);
  if (a.author) lines.push(`作者：${a.author}`);
  return lines.join('\n');
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * 拉取 archive 当前状态 → embed → upsert 到 archives_embeddings
 * 只处理 status='published'。draft/archived 跳过（避免污染检索）。
 */
export async function embedAndUpsertArchive(archiveId: string): Promise<{ skipped?: 'not_published' | 'not_found'; ok?: true }> {
  const sb = getServiceClient();

  const { data: archive, error: fetchErr } = await sb
    .from('archives')
    .select('id, title, category, era, year, description, source, author, status')
    .eq('id', archiveId)
    .single();

  if (fetchErr || !archive) return { skipped: 'not_found' };
  if (archive.status !== 'published') {
    // 非 published：若历史上有对应 embedding，顺手删掉，避免向量库泄露非公开内容
    await sb.from('archives_embeddings').delete().eq('archive_id', archiveId);
    return { skipped: 'not_published' };
  }

  const chunkText = buildArchiveChunkText(archive);
  const vector = await embed(chunkText);

  const { error: upErr } = await sb
    .from('archives_embeddings')
    .upsert(
      {
        archive_id: archive.id,
        embedding: vector as unknown as string, // pgvector 接受 number[]
        chunk_text: chunkText,
        embedding_model: 'text-embedding-v3',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'archive_id' },
    );

  if (upErr) throw new Error(`embedAndUpsertArchive upsert failed: ${upErr.message}`);
  return { ok: true };
}
