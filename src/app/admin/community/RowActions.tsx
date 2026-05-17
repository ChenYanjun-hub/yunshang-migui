'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { setPostStatus, deletePostAdmin } from './actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function RowActions({
  id,
  status,
  title,
}: {
  id: string;
  status: string;
  /** 用于 delete 二次确认的文案 */
  title: string;
}) {
  const [pending, start] = useTransition();

  function onToggleVisibility() {
    const next = status === 'visible' ? 'hidden' : 'visible';
    start(async () => {
      try { await setPostStatus(id, next); } catch (e) { alert((e as Error).message); }
    });
  }

  function onDelete() {
    const label = title ? `《${title}》` : '这条帖子';
    if (!confirm(`将永久删除${label}及其所有评论 / 点赞。不可恢复，确认？`)) return;
    start(async () => {
      try { await deletePostAdmin(id); } catch (e) { alert((e as Error).message); }
    });
  }

  const btn = 'text-[10px] tracking-[0.3em] uppercase italic transition-colors disabled:opacity-50';

  return (
    <div className="flex items-center gap-3" style={enFont}>
      <Link
        href={`/community/${id}`}
        target="_blank"
        className={`${btn} text-text-secondary hover:text-accent`}
      >
        View
      </Link>
      <button
        onClick={onToggleVisibility}
        disabled={pending}
        className={`${btn} text-text-secondary hover:text-accent`}
        aria-label={status === 'visible' ? '隐藏此帖' : '恢复显示'}
      >
        {status === 'visible' ? 'Hide' : 'Show'}
      </button>
      <button
        onClick={onDelete}
        disabled={pending}
        className={`${btn} text-red-500/80 hover:text-red-500`}
        aria-label="删除此帖"
      >
        Delete
      </button>
    </div>
  );
}
