'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleLike } from './actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function LikeButton({
  postId, initialLiked, initialCount, requireLogin = false,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  requireLogin?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();
  const router = useRouter();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (requireLogin) {
      if (confirm('点赞需要登录，前往登录？')) {
        router.push('/auth/login?redirect=/community');
      }
      return;
    }
    // 乐观更新
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    start(async () => {
      const res = await toggleLike(postId);
      if (res.error) {
        // 回滚
        setLiked(!next);
        setCount((c) => c + (next ? -1 : 1));
        alert(res.error);
      } else {
        setLiked(res.liked);
        setCount(res.count);
      }
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-pressed={liked}
      className={`flex items-center gap-1.5 text-[10px] tracking-[0.3em] uppercase italic transition-colors disabled:opacity-50 ${
        liked ? 'text-accent' : 'text-text-muted hover:text-accent'
      }`}
      style={enFont}
    >
      <span aria-hidden>{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </button>
  );
}
