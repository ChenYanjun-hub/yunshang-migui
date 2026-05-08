'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import type { ProductFormState } from './actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export type ProductInitial = {
  id?: string;
  name?: string;
  price?: number;
  description?: string | null;
  category?: string | null;
  status?: string;
  image_urls?: string[];
};

const inputCls = 'w-full bg-transparent border border-border-hard px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors';
const labelCls = 'block text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-2';

export default function ProductForm({
  mode, initial, action,
}: {
  mode: 'create' | 'edit';
  initial?: ProductInitial;
  action: (prev: ProductFormState, fd: FormData) => Promise<ProductFormState>;
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, {});
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.image_urls ?? []);

  return (
    <form action={formAction}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-3" style={enFont}>
            {mode === 'create' ? 'New Product · 新增商品' : 'Edit Product · 编辑商品'}
          </p>
          <h1 className="font-serif text-3xl tracking-[0.1em] text-text-primary">
            {mode === 'create' ? '上架新商品' : initial?.name}
          </h1>
        </div>
        <Link href="/admin/products" className="text-[11px] tracking-[0.3em] uppercase italic text-text-secondary hover:text-accent" style={enFont}>
          ← Back
        </Link>
      </div>

      <input type="hidden" name="image_urls" value={JSON.stringify(imageUrls)} />

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="md:col-span-2">
          <label className={labelCls} style={enFont}>Name · 名称</label>
          <input name="name" defaultValue={initial?.name ?? ''} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls} style={enFont}>Price (¥) · 价格</label>
          <input name="price" type="number" min="0" step="0.01" defaultValue={initial?.price ?? 0} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls} style={enFont}>Status · 状态</label>
          <select name="status" defaultValue={initial?.status ?? 'off_shelf'} className={inputCls}>
            <option value="off_shelf">下架</option>
            <option value="on_shelf">在架</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={enFont}>Category · 分类（自由填写）</label>
          <input name="category" defaultValue={initial?.category ?? ''} placeholder="例如：明信片 / 笔记本 / 模型" className={inputCls} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={enFont}>Description · 描述</label>
          <textarea name="description" defaultValue={initial?.description ?? ''} rows={4} className={inputCls + ' resize-y leading-relaxed'} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} style={enFont}>Images · 图片（第一张为封面）</label>
          <ImageUpload value={imageUrls} onChange={setImageUrls} pathPrefix="products" maxCount={6} />
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-500 border-l-2 border-red-500 pl-3 mb-4">{state.error}</p>
      )}

      <div className="flex items-center gap-4 pt-6 border-t border-border-subtle">
        <button type="submit" disabled={pending} className="px-6 py-2.5 bg-accent text-background font-serif tracking-[0.3em] text-sm hover:opacity-80 transition-opacity disabled:opacity-50">
          {pending ? '保存中…' : mode === 'create' ? '创 建' : '保 存'}
        </button>
        <Link href="/admin/products" className="px-6 py-2.5 border border-border-hard text-text-secondary tracking-[0.3em] text-sm hover:border-accent hover:text-accent transition-colors">
          取 消
        </Link>
      </div>
    </form>
  );
}
