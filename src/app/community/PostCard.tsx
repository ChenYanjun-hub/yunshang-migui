import Link from 'next/link';
import LikeButton from './LikeButton';
import { TAG_EN, TAG_LABEL, type PostListItem } from './types';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function PostCard({
  post, liked, isAuthed,
}: {
  post: PostListItem;
  liked: boolean;
  isAuthed: boolean;
}) {
  const cover = post.image_urls?.[0];
  const dateStr = new Date(post.created_at).toLocaleDateString('zh-CN');

  return (
    <article className="break-inside-avoid mb-6 bg-surface-1 border border-border-subtle hover:border-accent/50 transition-all duration-300 hover:shadow-[0_18px_36px_-20px_rgba(168,136,74,0.35)]">
      <Link href={`/community/${post.id}`} className="block">
        {cover && (
          <div className="relative overflow-hidden bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-auto block transition-transform duration-700 hover:scale-[1.04]"
              style={{ filter: 'sepia(0.10) contrast(0.98)' }}
            />
            <div className="absolute top-3 left-3 px-2 py-1 bg-background/85 border border-border-subtle">
              <span className="text-[9px] tracking-[0.3em] uppercase italic text-text-secondary" style={enFont}>
                {TAG_EN[post.tag]}
              </span>
            </div>
          </div>
        )}

        <div className="p-5">
          {!cover && (
            <span className="inline-block mb-3 px-2 py-1 border border-border-subtle text-[9px] tracking-[0.3em] uppercase italic text-text-secondary" style={enFont}>
              {TAG_EN[post.tag]} · {TAG_LABEL[post.tag]}
            </span>
          )}

          {post.title && (
            <h3 className="font-serif text-lg tracking-[0.05em] text-text-primary mb-2 hover:text-accent transition-colors line-clamp-2">
              {post.title}
            </h3>
          )}

          <p className="text-[13px] text-text-secondary leading-relaxed mb-4 line-clamp-3">
            {post.content}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-[10px] tracking-[0.2em] italic text-text-muted" style={enFont}>
            <span>{post.author_nickname} · {dateStr}</span>
          </div>
        </div>
      </Link>

      <div className="px-5 pb-4 flex items-center gap-5">
        <LikeButton
          postId={post.id}
          initialLiked={liked}
          initialCount={post.likes_count}
          requireLogin={!isAuthed}
        />
        <Link
          href={`/community/${post.id}`}
          className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] uppercase italic text-text-muted hover:text-accent transition-colors"
          style={enFont}
        >
          <span aria-hidden>💬</span>
          <span>{post.comments_count}</span>
        </Link>
      </div>
    </article>
  );
}
