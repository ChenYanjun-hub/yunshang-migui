import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

/**
 * 演示期社区管理：
 *   - 真实"列表 / 隐藏 / 删除 / 评论审核 / 举报队列"排在 5/18 之后
 *   - 此页提供 read-only 概览（总数 + 分类分布 + 最新 5 条），让 admin 至少能掌握
 *     社区现状
 *   - 内容操作通过 `npm run seed:community` 重置（清测试帖 + 注入 demo），
 *     5/23 演示前不依赖 admin UI
 */
export default async function AdminCommunityPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, content, tag, status, created_at, likes_count')
    .order('created_at', { ascending: false });

  const total = posts?.length ?? 0;
  const byTag = (posts ?? []).reduce<Record<string, number>>((acc, p) => {
    const t = p.tag ?? 'other';
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});
  const recent = (posts ?? []).slice(0, 5);

  return (
    <div>
      <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-3" style={enFont}>
        Community · 社区概览
      </p>
      <h1 className="font-serif text-3xl tracking-[0.1em] text-text-primary mb-8">
        帖子与评论审核
      </h1>

      {/* 概览数字 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        <StatCard label="Total" zh="总帖数" value={total} />
        <StatCard label="Memory" zh="米轨记忆" value={byTag.memory ?? 0} />
        <StatCard label="Photo" zh="老照片" value={byTag.photo ?? 0} />
        <StatCard label="Check-in" zh="打卡分享" value={byTag.checkin ?? 0} />
        <StatCard label="Other" zh="其他" value={byTag.other ?? 0} />
      </div>

      {/* 最新 5 条 */}
      <section className="mb-10">
        <p className="archive-label text-text-muted mb-3" style={{ fontFamily: 'var(--font-typewriter)' }}>
          RECENT · 最新 5 条
        </p>
        <ul className="divide-y divide-border-subtle border-y border-border-subtle">
          {recent.length === 0 && (
            <li className="py-6 text-sm text-text-muted text-center">
              暂无帖子。运行 <code className="text-cinnabar">npm run seed:community</code> 注入演示数据。
            </li>
          )}
          {recent.map((p) => (
            <li key={p.id} className="py-3 flex items-center gap-4">
              <span
                className="shrink-0 text-[10px] tracking-[0.3em] uppercase text-cinnabar"
                style={{ fontFamily: 'var(--font-typewriter)' }}
              >
                {p.tag ?? 'other'}
              </span>
              <Link
                href={`/community/${p.id}`}
                target="_blank"
                className="flex-1 truncate font-serif text-sm text-text-primary hover:text-cinnabar transition-colors"
              >
                {p.title ?? p.content.slice(0, 30) + '…'}
              </Link>
              <span className="shrink-0 text-[11px] text-text-muted tracking-wider" style={enFont}>
                {new Date(p.created_at).toLocaleDateString('zh-CN')}
              </span>
              <span className="shrink-0 text-[11px] text-text-muted">♡ {p.likes_count ?? 0}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 演示期说明 */}
      <div className="border border-cinnabar/30 bg-cinnabar/[0.04] p-5">
        <p
          className="archive-label text-cinnabar mb-2"
          style={{ fontFamily: 'var(--font-typewriter)' }}
        >
          DEMO PHASE · 演示期说明
        </p>
        <p className="text-sm text-text-secondary leading-relaxed">
          完整的「列表 / 单条隐藏 / 删除 / 评论审核 / 举报队列」管理 UI 排在 <strong>5/18 之后</strong>。
          演示期社区数据由 <code className="text-cinnabar mx-1">scripts/seed-community-demo.ts</code>
          管理：清除测试帖 + 注入 5 条 demo 帖（覆盖 4 种 tag）。
          需要重置时在终端跑 <code className="text-cinnabar mx-1">npm run seed:community</code>。
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, zh, value }: { label: string; zh: string; value: number }) {
  return (
    <div className="border border-border-subtle bg-surface-1 p-4">
      <p
        className="text-[10px] tracking-[0.3em] uppercase text-text-muted mb-1.5"
        style={{ fontFamily: 'var(--font-serif-en)' }}
      >
        {label}
      </p>
      <p className="font-serif text-3xl tracking-tight text-text-primary mb-0.5">{value}</p>
      <p className="text-[11px] text-text-secondary">{zh}</p>
    </div>
  );
}
