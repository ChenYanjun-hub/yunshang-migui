'use client';

import { useTransition } from 'react';
import { deleteCommentAdmin } from './actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function CommentRowActions({
  commentId,
  postId,
  preview,
}: {
  commentId: string;
  postId: string;
  /** 二次确认时展示前 20 字 */
  preview: string;
}) {
  const [pending, start] = useTransition();

  function onDelete() {
    if (!confirm(`将永久删除评论："${preview.slice(0, 20)}${preview.length > 20 ? '…' : ''}"。不可恢复，确认？`)) return;
    start(async () => {
      try { await deleteCommentAdmin(commentId, postId); } catch (e) { alert((e as Error).message); }
    });
  }

  return (
    <button
      onClick={onDelete}
      disabled={pending}
      className="text-[10px] tracking-[0.3em] uppercase italic text-red-500/80 hover:text-red-500 disabled:opacity-50 transition-colors"
      style={enFont}
      aria-label="删除此评论"
    >
      Delete
    </button>
  );
}
