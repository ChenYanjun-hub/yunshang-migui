import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '../auth/actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const ROLE_LABEL: Record<string, string> = {
  user: '普通用户',
  admin_product: '产品部',
  admin_tech: '技术部',
  admin_ops: '运营部',
  admin_biz: '商务部',
  super_admin: '超级管理员',
};

const ALL_ITEMS = [
  { href: '/admin', label: '总览', en: 'Overview', roles: ['*'] },
  { href: '/admin/archives', label: '史料管理', en: 'Archives', roles: ['admin_product', 'super_admin'] },
  { href: '/admin/products', label: '商品管理', en: 'Products', roles: ['admin_biz', 'super_admin'] },
  { href: '/admin/community', label: '社区审核', en: 'Community', roles: ['admin_ops', 'super_admin'] },
  { href: '/admin/users', label: '用户管理', en: 'Users', roles: ['super_admin'] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/admin');

  const { data: profile } = await supabase
    .from('profiles').select('nickname, role').eq('id', user.id).single();

  const role = profile?.role ?? 'user';
  if (role === 'user') redirect('/user');

  const items = ALL_ITEMS.filter(i => i.roles.includes('*') || i.roles.includes(role));

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <div className="border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="font-serif text-lg tracking-[0.2em] text-text-primary">云上米轨</span>
            <span className="text-[10px] tracking-[0.4em] uppercase italic text-accent" style={enFont}>
              Admin Console
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[11px] tracking-[0.3em] italic text-text-muted" style={enFont}>
              {profile?.nickname ?? user.email} · {ROLE_LABEL[role]}
            </span>
            <Link href="/user" className="text-[10px] tracking-[0.3em] uppercase italic text-text-secondary hover:text-accent" style={enFont}>
              ← User
            </Link>
            <form action={signOut}>
              <button className="text-[10px] tracking-[0.3em] uppercase italic text-text-secondary hover:text-accent" style={enFont}>
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid gap-10 md:grid-cols-[200px_1fr]">
        <aside className="border-r border-border-subtle pr-6 hidden md:block">
          <p className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-5" style={enFont}>
            Navigation
          </p>
          <nav className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2.5 group"
              >
                <span className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted block group-hover:text-accent transition-colors" style={enFont}>
                  {item.en}
                </span>
                <span className="font-serif text-sm tracking-[0.1em] text-text-primary group-hover:text-accent transition-colors">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
