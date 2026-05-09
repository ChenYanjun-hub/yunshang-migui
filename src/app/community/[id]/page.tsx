import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { createClient } from '@/lib/supabase/server';
import LikeButton from '../LikeButton';
import CommentForm from '../CommentForm';
import { TAG_LABEL, TAG_EN, type PostTag } from '../types';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;
const VALID_TAGS: PostTag[] = ['memory', 'photo', 'checkin', 'other'];

type Params = Promise<{ id: string }>;

export default async function PostDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  type PostDetailRow = {
    id: string;
    title: string | null;
    content: string;
    image_urls: string[] | null;
    tag: string | null;
    likes_count: number | null;
    created_at: string;
    user_id: string;
    profiles: { nickname: string | null; avatar_url: string | null } | null;
  };
  const { data: post } = await supabase
    .from('posts')
    .select('id, title, content, image_urls, tag, likes_count, created_at, user_id, profiles!user_id(nickname, avatar_url)')
    .eq('id', id)
    .eq('status', 'visible')
    .single<PostDetailRow>();

  if (!post) notFound();

  type CommentRow = {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: { nickname: string | null } | null;
  };
  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, profiles!user_id(nickname)')
    .eq('post_id', id)
    .eq('status', 'visible')
    .order('created_at', { ascending: true })
    .returns<CommentRow[]>();

  let liked = false;
  if (user) {
    const { data: row } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', id).eq('user_id', user.id)
      .maybeSingle();
    liked = !!row;
  }

  const tag = (VALID_TAGS.includes(post.tag as PostTag) ? post.tag : 'other') as PostTag;
  const author = post.profiles?.nickname ?? '米轨用户';
  const dateStr = new Date(post.created_at).toLocaleString('zh-CN');
  const images = Array.isArray(post.image_urls) ? post.image_urls : [];

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/community" className="text-[11px] tracking-[0.3em] uppercase italic text-text-secondary hover:text-accent mb-6 inline-block" style={enFont}>
            ← Back to Community
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-1 border border-border-subtle text-[9px] tracking-[0.3em] uppercase italic text-accent" style={enFont}>
              {TAG_EN[tag]} · {TAG_LABEL[tag]}
            </span>
            <span className="text-[11px] italic text-text-muted" style={enFont}>
              {author} · {dateStr}
            </span>
          </div>

          {post.title && (
            <h1 className="font-serif text-3xl md:text-4xl tracking-[0.05em] text-text-primary mb-6 leading-tight">
              {post.title}
            </h1>
          )}

          <div className="text-base text-text-secondary leading-loose whitespace-pre-wrap mb-8">
            {post.content}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {images.map((url) => (
                <div key={url} className="bg-surface-2 border border-border-subtle overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" loading="lazy" className="w-full h-auto block" style={{ filter: 'sepia(0.10) contrast(0.98)' }} />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 py-4 border-y border-border-subtle">
            <LikeButton
              postId={post.id}
              initialLiked={liked}
              initialCount={post.likes_count ?? 0}
              requireLogin={!user}
            />
            <span className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>
              💬 {comments?.length ?? 0} 条评论
            </span>
          </div>

          <div className="mt-10 mb-6">
            <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4" style={enFont}>
              Comments · 评论
            </p>

            <div className="space-y-5 mb-8">
              {comments && comments.length > 0 ? comments.map((c) => (
                <div key={c.id} className="border-l-2 border-border-subtle pl-4 py-1">
                  <p className="text-[11px] tracking-[0.2em] italic text-text-muted mb-1" style={enFont}>
                    {c.profiles?.nickname ?? '米轨用户'} · {new Date(c.created_at).toLocaleString('zh-CN')}
                  </p>
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{c.content}</p>
                </div>
              )) : (
                <p className="text-sm text-text-muted italic">暂无评论，做第一个回复的人。</p>
              )}
            </div>

            <CommentForm postId={post.id} isAuthed={!!user} />
          </div>
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
