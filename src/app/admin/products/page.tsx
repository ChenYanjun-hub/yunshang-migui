import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import RowActions from './RowActions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, category, status, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-3" style={enFont}>
            Products · 商品管理
          </p>
          <h1 className="font-serif text-3xl tracking-[0.1em] text-text-primary">
            共 {products?.length ?? 0} 件
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="px-5 py-2.5 bg-accent text-background text-xs tracking-[0.3em] uppercase italic hover:opacity-80 transition-opacity"
          style={enFont}
        >
          + 新增商品
        </Link>
      </div>

      <div className="border border-border-subtle">
        <div className="grid grid-cols-[1fr_120px_100px_120px_280px] gap-4 px-5 py-3 border-b border-border-subtle bg-surface-1 text-[10px] tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>
          <span>名称</span><span>分类</span><span>价格</span><span>状态</span><span className="text-right">操作</span>
        </div>
        {products?.length ? products.map((p) => (
          <div key={p.id} className="grid grid-cols-[1fr_120px_100px_120px_280px] gap-4 px-5 py-4 border-b border-border-subtle last:border-b-0 text-sm items-center">
            <span className="font-serif text-text-primary truncate">{p.name}</span>
            <span className="text-text-secondary">{p.category ?? '—'}</span>
            <span className="text-text-secondary">¥ {Number(p.price).toFixed(2)}</span>
            <span className={p.status === 'on_shelf' ? 'text-accent' : 'text-text-muted'}>
              {p.status === 'on_shelf' ? '在架' : '下架'}
            </span>
            <div className="flex justify-end">
              <RowActions id={p.id} status={p.status} />
            </div>
          </div>
        )) : (
          <div className="px-5 py-12 text-center text-sm text-text-muted">暂无商品，点右上角"新增商品"开始</div>
        )}
      </div>
    </div>
  );
}
