'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import PostCard from './PostCard';
import { TAG_LABEL, TAG_EN, type PostListItem, type PostTag } from './types';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function CommunityClient({
  posts, likedSet, isAuthed,
}: {
  posts: PostListItem[];
  likedSet: string[];
  isAuthed: boolean;
}) {
  const [tag, setTag] = useState<PostTag | 'all'>('all');
  const router = useRouter();
  const liked = useMemo(() => new Set(likedSet), [likedSet]);

  const list = tag === 'all' ? posts : posts.filter((p) => p.tag === tag);
  const tags: (PostTag | 'all')[] = ['all', 'memory', 'photo', 'checkin', 'other'];

  function onNew() {
    if (!isAuthed) {
      if (confirm('发帖需要登录，前往登录？')) {
        router.push('/auth/login?redirect=/community/new');
      }
      return;
    }
    router.push('/community/new');
  }

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4" style={enFont}>
            Community · 米轨同好
          </p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-[0.05em] text-text-primary mb-6 leading-tight">
            米轨同好社区
          </h1>
          <p className="italic text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mb-3" style={enFont}>
            Memories, photographs and journeys —<br className="hidden md:block" />
            shared along the steel spine.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            分享你与米轨的故事 — 旅人的记忆、老照片、沿线打卡，皆汇于此。
          </p>
        </div>
      </section>

      <section className="border-y border-border-subtle bg-surface-2/50">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`px-4 py-1.5 text-xs tracking-[0.25em] border transition-all duration-200 ${
                  tag === t
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-border-hard text-text-secondary hover:border-accent/60 hover:text-text-primary'
                }`}
              >
                <span className="block">{t === 'all' ? '全部' : TAG_LABEL[t]}</span>
                <span className="block text-[9px] tracking-[0.4em] italic mt-0.5 opacity-60" style={enFont}>
                  {t === 'all' ? 'All' : TAG_EN[t]}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={onNew}
            className="px-5 py-2.5 bg-accent text-background text-xs tracking-[0.3em] uppercase italic hover:opacity-80 transition-opacity"
            style={enFont}
          >
            + 发布新帖
          </button>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          {list.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-[11px] tracking-[0.4em] uppercase italic text-text-muted mb-3" style={enFont}>
                No posts
              </p>
              <p className="font-serif text-xl text-text-secondary mb-6">
                {posts.length === 0 ? '社区暂无帖子' : '该分类暂无帖子'}
              </p>
              {posts.length === 0 && (
                <Link href="/community/new" className="text-accent text-sm hover:underline italic" style={enFont}>
                  做第一个发帖的人 →
                </Link>
              )}
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {list.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  liked={liked.has(post.id)}
                  isAuthed={isAuthed}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="py-10 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-sm tracking-[0.2em] text-text-primary">云上米轨</span>
            <span className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted" style={enFont}>
              Yunshang Migui
            </span>
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>
            © 2026 · Dianyue Railway Digital Heritage Platform
          </p>
        </div>
      </footer>
    </main>
  );
}
