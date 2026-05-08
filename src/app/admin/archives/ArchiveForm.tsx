'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import type { ArchiveFormState } from './actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const CATEGORIES = [
  { v: 'photo', label: '老照片' },
  { v: 'document', label: '文献' },
  { v: 'map', label: '手绘地图' },
  { v: 'blueprint', label: '工程图纸' },
  { v: 'newspaper', label: '报刊剪报' },
  { v: 'oral_history', label: '口述史' },
];
const ERAS = [
  { v: 'construction', label: '修建期' },
  { v: 'operation', label: '运营期' },
  { v: 'republic', label: '民国时期' },
  { v: 'prc', label: '建国后' },
  { v: 'heritage', label: '遗产保护' },
];
const STATUSES = [
  { v: 'draft', label: '草稿' },
  { v: 'published', label: '已发布' },
  { v: 'archived', label: '已归档' },
];

export type ArchiveInitial = {
  id?: string;
  title?: string;
  category?: string;
  era?: string;
  year?: number | null;
  description?: string | null;
  source?: string | null;
  author?: string | null;
  status?: string;
  image_urls?: string[];
  image_height?: number | null;
};

type Props = {
  mode: 'create' | 'edit';
  initial?: ArchiveInitial;
  action: (prev: ArchiveFormState, fd: FormData) => Promise<ArchiveFormState>;
};

const inputCls = 'w-full bg-transparent border border-border-hard px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors';
const labelCls = 'block text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-2';

export default function ArchiveForm({ mode, initial, action }: Props) {
  const [state, formAction, pending] = useActionState<ArchiveFormState, FormData>(action, {});
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.image_urls ?? []);
  const [imageHeight, setImageHeight] = useState<number | null>(initial?.image_height ?? null);

  return (
    <form action={formAction}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-3" style={enFont}>
            {mode === 'create' ? 'New Archive · 新增史料' : 'Edit Archive · 编辑史料'}
          </p>
          <h1 className="font-serif text-3xl tracking-[0.1em] text-text-primary">
            {mode === 'create' ? '录入新史料' : initial?.title}
          </h1>
        </div>
        <Link href="/admin/archives" className="text-[11px] tracking-[0.3em] uppercase italic text-text-secondary hover:text-accent" style={enFont}>
          ← Back
        </Link>
      </div>

      <input type="hidden" name="image_urls" value={JSON.stringify(imageUrls)} />
      <input type="hidden" name="image_height" value={imageHeight ?? ''} />

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="md:col-span-2">
          <label className={labelCls} style={enFont}>Title · 标题</label>
          <input name="title" defaultValue={initial?.title ?? ''} required className={inputCls} />
        </div>

        <div>
          <label className={labelCls} style={enFont}>Category · 类型</label>
          <select name="category" defaultValue={initial?.category ?? ''} required className={inputCls}>
            <option value="" disabled>选择类型…</option>
            {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} style={enFont}>Era · 时期</label>
          <select name="era" defaultValue={initial?.era ?? ''} required className={inputCls}>
            <option value="" disabled>选择时期…</option>
            {ERAS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls} style={enFont}>Year · 年份</label>
          <input name="year" type="number" min="1800" max="2100" defaultValue={initial?.year ?? ''} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} style={enFont}>Status · 状态</label>
          <select name="status" defaultValue={initial?.status ?? 'draft'} className={inputCls}>
            {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={labelCls} style={enFont}>Description · 描述</label>
          <textarea name="description" defaultValue={initial?.description ?? ''} rows={4} className={inputCls + ' resize-y leading-relaxed'} />
        </div>

        <div>
          <label className={labelCls} style={enFont}>Source · 来源</label>
          <input name="source" defaultValue={initial?.source ?? ''} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} style={enFont}>Author · 录入人</label>
          <input name="author" defaultValue={initial?.author ?? ''} className={inputCls} />
        </div>

        <div className="md:col-span-2">
          <label className={labelCls} style={enFont}>Images · 图片（第一张为封面）</label>
          <ImageUpload
            value={imageUrls}
            onChange={setImageUrls}
            pathPrefix="archives"
            maxCount={8}
            onMeta={(m) => setImageHeight(m.height)}
          />
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
          {pending ? '保存中…' : mode === 'create' ? '创 建' : '保 存'}
        </button>
        <Link href="/admin/archives" className="px-6 py-2.5 border border-border-hard text-text-secondary tracking-[0.3em] text-sm hover:border-accent hover:text-accent transition-colors">
          取 消
        </Link>
      </div>
    </form>
  );
}
