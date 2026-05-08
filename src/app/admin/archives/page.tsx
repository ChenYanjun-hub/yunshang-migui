import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import RowActions from './RowActions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const STATUS_LABEL: Record<string, string> = {
  draft: '草稿', published: '已发布', archived: '已归档',
};

export default async function AdminArchivesPage() {
  const supabase = await createClient();
  const { data: archives } = await supabase
    .from('archives')
    .select('id, title, category, era, year, status, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-3" style={enFont}>
            Archives · 史料管理
          </p>
          <h1 className="font-serif text-3xl tracking-[0.1em] text-text-primary">
            共 {archives?.length ?? 0} 条
          </h1>
        </div>
        <Link
          href="/admin/archives/new"
          className="px-5 py-2.5 bg-accent text-background text-xs tracking-[0.3em] uppercase italic hover:opacity-80 transition-opacity"
          style={enFont}
        >
          + 新增史料
        </Link>
      </div>

      <div className="border border-border-subtle">
        <div className="grid grid-cols-[1fr_100px_100px_80px_100px_320px] gap-4 px-5 py-3 border-b border-border-subtle bg-surface-1 text-[10px] tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>
          <span>标题</span><span>类型</span><span>时期</span><span>年份</span><span>状态</span><span className="text-right">操作</span>
        </div>
        {archives?.length ? archives.map((a) => (
          <div key={a.id} className="grid grid-cols-[1fr_100px_100px_80px_100px_320px] gap-4 px-5 py-4 border-b border-border-subtle last:border-b-0 text-sm items-center">
            <span className="font-serif text-text-primary truncate">{a.title}</span>
            <span className="text-text-secondary">{a.category}</span>
            <span className="text-text-secondary">{a.era}</span>
            <span className="text-text-secondary">{a.year ?? '—'}</span>
            <span className={a.status === 'published' ? 'text-accent' : 'text-text-muted'}>
              {STATUS_LABEL[a.status] ?? a.status}
            </span>
            <div className="flex justify-end">
              <RowActions id={a.id} status={a.status} />
            </div>
          </div>
        )) : (
          <div className="px-5 py-12 text-center text-sm text-text-muted">暂无数据，点右上角"新增史料"开始</div>
        )}
      </div>
    </div>
  );
}
