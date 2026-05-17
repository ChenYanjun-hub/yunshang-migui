import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import RowActions from './RowActions';
import CommentRowActions from './CommentRowActions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const TAG_LABEL: Record<string, string> = {
  memory: '米轨记忆',
  photo: '老照片',
  checkin: '打卡分享',
  other: '其他',
};

type PostRow = {
  id: string;
  title: string | null;
  content: string;
  tag: string | null;
  status: string;
  created_at: string;
  likes_count: number | null;
  user_id: string;
  profiles: { nickname: string | null } | null;
};

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  profiles: { nickname: string | null } | null;
  posts: { title: string | null; content: string } | null;
};

/**
 * 社区管理后台 —— 演示版（5/17 完整版）
 *
 *  上半区：概览数字（总数 + 4 tag 分布 + hidden 占比）
 *  中间区：帖子全列表（含 hidden，admin 可见所有）
 *           · View（新窗打开 /community/[id]）
 *           · Hide / Show（toggle status visible ↔ hidden）
 *           · Delete（二次确认，CASCADE 清评论 + 点赞）
 *  下半区：最近 20 条评论 + 单条删除
 *
 *  不做：评论批量审核 / 举报队列 / 用户封禁 —— 演示后排
 */
export default async function AdminCommunityPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, content, tag, status, created_at, likes_count, user_id, profiles!user_id(nickname)')
    .order('created_at', { ascending: false })
    .returns<PostRow[]>();

  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, post_id, profiles!user_id(nickname), posts!post_id(title, content)')
    .order('created_at', { ascending: false })
    .limit(20)
    .returns<CommentRow[]>();

  const allPosts = posts ?? [];
  const allComments = comments ?? [];

  // 统计
  const total = allPosts.length;
  const hiddenCount = allPosts.filter((p) => p.status === 'hidden').length;
  const byTag = allPosts.reduce<Record<string, number>>((acc, p) => {
    const t = p.tag ?? 'other';
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-3" style={enFont}>
        Community · 社区审核
      </p>
      <h1 className="font-serif text-3xl tracking-[0.1em] text-text-primary mb-8">
        帖子与评论审核
      </h1>

      {/* 概览数字 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-10">
        <StatCard label="Total" zh="总帖数" value={total} />
        <StatCard label="Memory" zh="米轨记忆" value={byTag.memory ?? 0} />
        <StatCard label="Photo" zh="老照片" value={byTag.photo ?? 0} />
        <StatCard label="Check-in" zh="打卡分享" value={byTag.checkin ?? 0} />
        <StatCard label="Other" zh="其他" value={byTag.other ?? 0} />
        <StatCard label="Hidden" zh="已隐藏" value={hiddenCount} alert />
      </div>

      {/* 帖子列表 */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-3">
          <p className="archive-label text-text-muted" style={{ fontFamily: 'var(--font-typewriter)' }}>
            POSTS · 帖子全列表 · {total}
          </p>
          <span className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>
            sorted by created_at desc
          </span>
        </div>

        {allPosts.length === 0 ? (
          <div className="border border-dashed border-border-subtle py-12 text-center text-sm text-text-muted">
            暂无帖子。运行 <code className="text-cinnabar">npm run seed:community</code> 注入演示数据。
          </div>
        ) : (
          <div className="border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-[10px] tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>
                <tr>
                  <th className="px-3 py-2.5 text-left w-16">Tag</th>
                  <th className="px-3 py-2.5 text-left">Title / Excerpt</th>
                  <th className="px-3 py-2.5 text-left w-28">Author</th>
                  <th className="px-3 py-2.5 text-left w-20">Status</th>
                  <th className="px-3 py-2.5 text-center w-14">♡</th>
                  <th className="px-3 py-2.5 text-left w-24">Date</th>
                  <th className="px-3 py-2.5 text-right w-56">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {allPosts.map((p) => {
                  const tagKey = p.tag ?? 'other';
                  const excerpt = (p.title ?? p.content).replace(/\n+/g, ' ').slice(0, 64);
                  return (
                    <tr key={p.id} className={p.status === 'hidden' ? 'bg-red-500/[0.03]' : ''}>
                      <td className="px-3 py-2.5">
                        <span
                          className="text-[10px] tracking-[0.25em] uppercase text-cinnabar"
                          style={{ fontFamily: 'var(--font-typewriter)' }}
                        >
                          {TAG_LABEL[tagKey] ?? tagKey}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`font-serif ${p.status === 'hidden' ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                          {excerpt}
                          {(p.title ?? p.content).length > 64 ? '…' : ''}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-text-secondary text-xs truncate">
                        {p.profiles?.nickname ?? '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-3 py-2.5 text-center text-text-secondary text-xs tabular-nums">
                        {p.likes_count ?? 0}
                      </td>
                      <td className="px-3 py-2.5 text-text-muted text-xs tabular-nums" style={enFont}>
                        {new Date(p.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <RowActions id={p.id} status={p.status} title={p.title ?? ''} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 评论列表 */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-3">
          <p className="archive-label text-text-muted" style={{ fontFamily: 'var(--font-typewriter)' }}>
            COMMENTS · 最近 20 条评论
          </p>
          <span className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>
            sorted by created_at desc
          </span>
        </div>

        {allComments.length === 0 ? (
          <div className="border border-dashed border-border-subtle py-10 text-center text-sm text-text-muted">
            暂无评论
          </div>
        ) : (
          <ul className="border border-border-subtle divide-y divide-border-subtle">
            {allComments.map((c) => (
              <li key={c.id} className="px-3 py-3 flex items-start gap-4 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-xs text-text-secondary truncate">
                      {c.profiles?.nickname ?? '—'}
                    </span>
                    <Link
                      href={`/community/${c.post_id}`}
                      target="_blank"
                      className="text-[10px] tracking-[0.25em] uppercase text-accent hover:underline truncate"
                      style={enFont}
                    >
                      ↳ {(c.posts?.title ?? c.posts?.content ?? '').slice(0, 30) || '—'}
                    </Link>
                    <span className="ml-auto text-[10px] text-text-muted tabular-nums" style={enFont}>
                      {new Date(c.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-text-primary font-serif text-[13.5px] leading-relaxed line-clamp-2 break-words">
                    {c.content}
                  </p>
                </div>
                <div className="shrink-0">
                  <CommentRowActions commentId={c.id} postId={c.post_id} preview={c.content} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* seed 说明 */}
      <div className="border border-border-subtle bg-surface-2/40 p-4">
        <p
          className="text-[10px] tracking-[0.3em] uppercase text-text-muted mb-1.5"
          style={{ fontFamily: 'var(--font-typewriter)' }}
        >
          DATA OPS · 数据运维
        </p>
        <p className="text-xs text-text-secondary leading-relaxed">
          演示数据可通过 <code className="text-cinnabar mx-0.5">npm run seed:community</code> 重置（
          清测试帖 + 注入 5 条 demo）。脚本幂等，重跑安全。
          后续如需自动化数据修剪 / 举报队列 / 用户封禁，排在 v2。
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label, zh, value, alert,
}: { label: string; zh: string; value: number; alert?: boolean }) {
  return (
    <div className={`border p-4 ${alert && value > 0 ? 'border-red-500/40 bg-red-500/[0.04]' : 'border-border-subtle bg-surface-1'}`}>
      <p
        className={`text-[10px] tracking-[0.3em] uppercase mb-1.5 ${alert && value > 0 ? 'text-red-500/80' : 'text-text-muted'}`}
        style={{ fontFamily: 'var(--font-serif-en)' }}
      >
        {label}
      </p>
      <p className="font-serif text-3xl tracking-tight text-text-primary mb-0.5 tabular-nums">{value}</p>
      <p className="text-[11px] text-text-secondary">{zh}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'hidden') {
    return (
      <span
        className="inline-block px-2 py-0.5 text-[10px] tracking-[0.25em] uppercase border border-red-500/40 text-red-500/90"
        style={{ fontFamily: 'var(--font-typewriter)' }}
      >
        hidden
      </span>
    );
  }
  return (
    <span
      className="inline-block px-2 py-0.5 text-[10px] tracking-[0.25em] uppercase border border-border-subtle text-text-secondary"
      style={{ fontFamily: 'var(--font-typewriter)' }}
    >
      visible
    </span>
  );
}
