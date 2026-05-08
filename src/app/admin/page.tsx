import { createClient } from '@/lib/supabase/server';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default async function AdminOverview() {
  const supabase = await createClient();

  const [archives, products, posts, users] = await Promise.all([
    supabase.from('archives').select('id, status', { count: 'exact', head: false }),
    supabase.from('products').select('id, status', { count: 'exact', head: false }),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  const archivePublished = archives.data?.filter((a) => a.status === 'published').length ?? 0;
  const archiveDraft = archives.data?.filter((a) => a.status === 'draft').length ?? 0;
  const productOnShelf = products.data?.filter((p) => p.status === 'on_shelf').length ?? 0;

  const cards = [
    { label: '已发布史料', en: 'Published Archives', value: archivePublished, sub: `草稿 ${archiveDraft}` },
    { label: '在架商品', en: 'Products On Shelf', value: productOnShelf, sub: `总计 ${products.data?.length ?? 0}` },
    { label: '社区帖子', en: 'Community Posts', value: posts.count ?? 0, sub: '全部' },
    { label: '注册用户', en: 'Registered Users', value: users.count ?? 0, sub: '含管理员' },
  ];

  return (
    <div>
      <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4" style={enFont}>
        Overview · 数据总览
      </p>
      <h1 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-text-primary mb-10">
        管理控制台
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-subtle border border-border-subtle">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface-1 p-6">
            <div className="font-serif text-3xl md:text-4xl text-text-primary mb-3">{c.value}</div>
            <div className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-1" style={enFont}>
              {c.en}
            </div>
            <div className="text-xs text-text-secondary">{c.label} · {c.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 border-l-2 border-accent pl-4 text-sm text-text-secondary">
        <p className="mb-2">提示：左侧栏按你的角色显示可访问模块。</p>
        <p>明晚（5月8日）将完成史料 / 商品的增删改查表单与图片上传。</p>
      </div>
    </div>
  );
}
