/**
 * 一次性脚本：把 archives 表里所有 status='published' 的条目 embed 入 archives_embeddings
 *
 * 跑法：
 *   npm run embed:archives
 *
 * 幂等：archive_id 是 PK + upsert，重复执行只会刷新已有行。
 * 增量：默认只处理"未 embed 过 或 archive.updated_at > embedding.updated_at"的条目。
 *       传 --all 强制全量重算。
 */

import { createClient } from '@supabase/supabase-js';
import { embedBatch } from '../src/lib/ai/embed';
import { buildArchiveChunkText, type ArchiveForEmbedding } from '../src/lib/ai/archive-embed';

type ArchiveRow = ArchiveForEmbedding & { updated_at: string };

type ExistingRow = {
  archive_id: string;
  updated_at: string;
};

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set in .env.local`);
  return v;
}

async function main() {
  const forceAll = process.argv.includes('--all');

  const supabase = createClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false } },
  );

  // 拉所有 published archives
  const { data: archives, error: aErr } = await supabase
    .from('archives')
    .select('id, title, category, era, year, description, source, author, updated_at')
    .eq('status', 'published');

  if (aErr) throw aErr;
  if (!archives || archives.length === 0) {
    console.log('[embed] no published archives found.');
    return;
  }
  console.log(`[embed] fetched ${archives.length} published archives`);

  // 拉已有 embeddings 的更新时间，做增量过滤
  let existingMap = new Map<string, string>();
  if (!forceAll) {
    const { data: existing, error: eErr } = await supabase
      .from('archives_embeddings')
      .select('archive_id, updated_at');
    if (eErr) throw eErr;
    existingMap = new Map((existing as ExistingRow[] ?? []).map((r) => [r.archive_id, r.updated_at]));
  }

  const todo = (archives as ArchiveRow[]).filter((a) => {
    if (forceAll) return true;
    const prev = existingMap.get(a.id);
    if (!prev) return true; // 没 embed 过
    return new Date(a.updated_at).getTime() > new Date(prev).getTime();
  });

  if (todo.length === 0) {
    console.log('[embed] nothing to update. (use --all to force)');
    return;
  }
  console.log(`[embed] embedding ${todo.length} archives (forceAll=${forceAll})`);

  const texts = todo.map(buildArchiveChunkText);

  console.log('[embed] sample chunk[0]:\n---\n' + texts[0] + '\n---');

  const vectors = await embedBatch(texts);
  console.log(`[embed] got ${vectors.length} vectors (dim=${vectors[0]?.length})`);

  const rows = todo.map((a, i) => ({
    archive_id: a.id,
    embedding: vectors[i] as unknown as string, // pgvector 接受 number[]，supabase-js 序列化为 JSON
    chunk_text: texts[i],
    embedding_model: 'text-embedding-v3',
    updated_at: new Date().toISOString(),
  }));

  // 分批 upsert，避免单次 payload 过大
  const UPSERT_CHUNK = 50;
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
    const slice = rows.slice(i, i + UPSERT_CHUNK);
    const { error: uErr } = await supabase
      .from('archives_embeddings')
      .upsert(slice, { onConflict: 'archive_id' });
    if (uErr) throw uErr;
    console.log(`[embed] upserted ${Math.min(i + UPSERT_CHUNK, rows.length)}/${rows.length}`);
  }

  console.log('[embed] done.');
}

main().catch((err) => {
  console.error('[embed] FAILED:', err);
  process.exit(1);
});
