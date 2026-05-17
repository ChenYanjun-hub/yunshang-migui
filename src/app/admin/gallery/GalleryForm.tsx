'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import type { GalleryFormState } from './actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const STATUSES = [
  { v: 'draft', label: '草稿' },
  { v: 'published', label: '已发布' },
  { v: 'archived', label: '已归档' },
];

export type GalleryInitial = {
  id?: string;
  title?: string;
  author?: string | null;
  story?: string | null;
  taken_at?: string | null;
  status?: string;
  photo_url?: string;
};

type Props = {
  mode: 'create' | 'edit';
  initial?: GalleryInitial;
  action: (prev: GalleryFormState, fd: FormData) => Promise<GalleryFormState>;
};

const inputCls =
  'w-full bg-transparent border border-border-hard px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors';
const labelCls =
  'block text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-2';

export default function GalleryForm({ mode, initial, action }: Props) {
  const [state, formAction, pending] = useActionState<GalleryFormState, FormData>(action, {});
  const [photoUrls, setPhotoUrls] = useState<string[]>(
    initial?.photo_url ? [initial.photo_url] : []
  );

  return (
    <form action={formAction}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p
            className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-3"
            style={enFont}
          >
            {mode === 'create' ? 'New Photo · 新增作品' : 'Edit Photo · 编辑作品'}
          </p>
          <h1 className="font-serif text-3xl tracking-[0.1em] text-text-primary">
            {mode === 'create' ? '录入新作品' : initial?.title}
          </h1>
        </div>
        <Link
          href="/admin/gallery"
          className="text-[11px] tracking-[0.3em] uppercase italic text-text-secondary hover:text-accent"
          style={enFont}
        >
          ← Back
        </Link>
      </div>

      <input type="hidden" name="photo_urls" value={JSON.stringify(photoUrls)} />

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="md:col-span-2">
          <label className={labelCls} style={enFont}>
            Title · 作品标题
          </label>
          <input
            name="title"
            defaultValue={initial?.title ?? ''}
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} style={enFont}>
            Author · 作者署名
          </label>
          <input
            name="author"
            defaultValue={initial?.author ?? ''}
            placeholder="例：李明 / 米轨爱好者"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} style={enFont}>
            Status · 状态
          </label>
          <select name="status" defaultValue={initial?.status ?? 'draft'} className={inputCls}>
            {STATUSES.map((s) => (
              <option key={s.v} value={s.v}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} style={enFont}>
            Taken At · 拍摄日期
          </label>
          <input
            name="taken_at"
            type="date"
            defaultValue={initial?.taken_at ?? ''}
            className={inputCls}
          />
        </div>
        <div />

        <div className="md:col-span-2">
          <label className={labelCls} style={enFont}>
            Story · 创作故事
          </label>
          <textarea
            name="story"
            defaultValue={initial?.story ?? ''}
            rows={4}
            placeholder="拍摄时的经历、对米轨的印象、想说的话…"
            className={inputCls + ' resize-y leading-relaxed'}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelCls} style={enFont}>
            Photo · 作品图片（仅一张）
          </label>
          <ImageUpload
            value={photoUrls}
            onChange={setPhotoUrls}
            pathPrefix="gallery"
            maxCount={1}
          />
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-500 border-l-2 border-red-500 pl-3 mb-4">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-4 pt-6 border-t border-border-subtle">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-accent text-background font-serif tracking-[0.3em] text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {pending ? '保存中…' : mode === 'create' ? '创 建' : '保 存'}
        </button>
        <Link
          href="/admin/gallery"
          className="px-6 py-2.5 border border-border-hard text-text-secondary tracking-[0.3em] text-sm hover:border-accent hover:text-accent transition-colors"
        >
          取 消
        </Link>
      </div>
    </form>
  );
}
