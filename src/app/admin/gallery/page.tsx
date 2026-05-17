import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import RowActions from './RowActions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const STATUS_LABEL: Record<string, string> = {
  draft: '草稿', published: '已发布', archived: '已归档',
};

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from('gallery_photos')
    .select('id, title, author, photo_url, taken_at, status, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-3" style={enFont}>
            User Gallery · 用户作品
          </p>
          <h1 className="font-serif text-3xl tracking-[0.1em] text-text-primary">
            共 {photos?.length ?? 0} 件作品
          </h1>
        </div>
        <Link
          href="/admin/gallery/new"
          className="px-5 py-2.5 bg-accent text-background text-xs tracking-[0.3em] uppercase italic hover:opacity-80 transition-opacity"
          style={enFont}
        >
          + 新增作品
        </Link>
      </div>

      <div className="border border-border-subtle">
        <div
          className="grid grid-cols-[80px_1fr_140px_120px_100px_320px] gap-4 px-5 py-3 border-b border-border-subtle bg-surface-1 text-[10px] tracking-[0.3em] uppercase italic text-text-muted"
          style={enFont}
        >
          <span>Cover</span>
          <span>标题</span>
          <span>作者</span>
          <span>拍摄日期</span>
          <span>状态</span>
          <span className="text-right">操作</span>
        </div>
        {photos?.length ? photos.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[80px_1fr_140px_120px_100px_320px] gap-4 px-5 py-4 border-b border-border-subtle last:border-b-0 text-sm items-center"
          >
            <div className="w-16 h-16 bg-surface-2 border border-border-subtle overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif text-text-primary truncate">{p.title}</span>
            <span className="text-text-secondary truncate">{p.author ?? '—'}</span>
            <span className="text-text-secondary">{p.taken_at ?? '—'}</span>
            <span className={p.status === 'published' ? 'text-accent' : 'text-text-muted'}>
              {STATUS_LABEL[p.status] ?? p.status}
            </span>
            <div className="flex justify-end">
              <RowActions id={p.id} status={p.status} />
            </div>
          </div>
        )) : (
          <div className="px-5 py-12 text-center text-sm text-text-muted">
            暂无作品，点右上角&ldquo;新增作品&rdquo;开始
          </div>
        )}
      </div>
    </div>
  );
}
