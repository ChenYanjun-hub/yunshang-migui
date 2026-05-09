'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import { createPost, type PostFormState } from './actions';
import { TAG_LABEL, type PostTag } from './types';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;
const inputCls = 'w-full bg-transparent border border-border-hard px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors';
const labelCls = 'block text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-2';

const TAGS: PostTag[] = ['memory', 'photo', 'checkin', 'other'];

export default function PostForm() {
  const [state, formAction, pending] = useActionState<PostFormState, FormData>(createPost, {});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [tag, setTag] = useState<PostTag>('memory');

  return (
    <form action={formAction}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-3" style={enFont}>
            New Post · 发布新帖
          </p>
          <h1 className="font-serif text-3xl tracking-[0.1em] text-text-primary">
            分享你的米轨故事
          </h1>
        </div>
        <Link href="/community" className="text-[11px] tracking-[0.3em] uppercase italic text-text-secondary hover:text-accent" style={enFont}>
          ← Back
        </Link>
      </div>

      <input type="hidden" name="image_urls" value={JSON.stringify(imageUrls)} />
      <input type="hidden" name="tag" value={tag} />

      <div className="space-y-6 mb-6">
        <div>
          <label className={labelCls} style={enFont}>Tag · 标签</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`px-4 py-1.5 text-xs tracking-[0.2em] border transition-all ${
                  tag === t
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-border-hard text-text-secondary hover:border-accent/60'
                }`}
              >
                {TAG_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls} style={enFont}>Title · 标题（可选）</label>
          <input name="title" maxLength={80} className={inputCls} placeholder="给你的故事起个名字…" />
        </div>

        <div>
          <label className={labelCls} style={enFont}>Content · 正文</label>
          <textarea name="content" required rows={6} className={inputCls + ' resize-y leading-relaxed'} placeholder="说说你和米轨的故事…" />
        </div>

        <div>
          <label className={labelCls} style={enFont}>Images · 图片（可选）</label>
          <ImageUpload value={imageUrls} onChange={setImageUrls} pathPrefix="posts" maxCount={9} />
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-500 border-l-2 border-red-500 pl-3 mb-4">{state.error}</p>
      )}

      <div className="flex items-center gap-4 pt-6 border-t border-border-subtle">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-accent text-background font-serif tracking-[0.3em] text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {pending ? '发布中…' : '发 布'}
        </button>
        <Link href="/community" className="px-6 py-2.5 border border-border-hard text-text-secondary tracking-[0.3em] text-sm hover:border-accent hover:text-accent transition-colors">
          取 消
        </Link>
      </div>
    </form>
  );
}
