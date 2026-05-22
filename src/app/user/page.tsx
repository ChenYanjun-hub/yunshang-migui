import { redirect } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '../auth/actions';
import ChangePasswordCard from './ChangePasswordCard';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const stats = [
  { label: '收藏', en: 'Collected', value: 0 },
  { label: '打卡', en: 'Check-ins', value: 0 },
  { label: '勋章', en: 'Stamps', value: 0 },
];

const menu = [
  { title: '我的收藏', en: 'Collected Records', desc: '收藏的史料、站点与展览' },
  { title: '打卡记录', en: 'Trail Log', desc: '沿米轨的足迹与时长统计' },
  { title: '我的勋章', en: 'Digital Stamps', desc: '32 站徽章与稀有电子印章' },
  { title: '订单管理', en: 'Orders', desc: '文创订单与研学预约' },
  { title: '会员权益', en: 'VIP Benefits', desc: 'VIP 专属高清原图与折扣' },
  { title: '账号设置', en: 'Account', desc: '个人信息、隐私与安全' },
];

const ROLE_LABEL: Record<string, { zh: string; en: string }> = {
  user: { zh: '普通会员', en: 'Member' },
  admin_product: { zh: '产品部', en: 'Product Admin' },
  admin_tech: { zh: '技术部', en: 'Tech Admin' },
  admin_ops: { zh: '运营部', en: 'Operations Admin' },
  admin_biz: { zh: '商务部', en: 'Business Admin' },
  super_admin: { zh: '超级管理员', en: 'Super Admin' },
};

export default async function UserPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/user');

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar_url, role, created_at')
    .eq('id', user.id)
    .single();

  const nickname = profile?.nickname ?? '米轨用户';
  const role = profile?.role ?? 'user';
  const roleLabel = ROLE_LABEL[role] ?? ROLE_LABEL.user;
  const joinedYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4"
            style={enFont}
          >
            Account · 个人中心
          </p>

          <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start mb-14 border-b border-border-subtle pb-12">
            <div className="w-24 h-24 bg-surface-1 border border-border-hard flex items-center justify-center font-serif text-2xl text-accent tracking-[0.2em] overflow-hidden">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={nickname} className="w-full h-full object-cover" />
              ) : (
                nickname.slice(0, 2)
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-text-primary mb-2">
                {nickname}
              </h1>
              <p
                className="text-[11px] tracking-[0.3em] italic text-text-muted mb-5"
                style={enFont}
              >
                {user.email} · joined {joinedYear}
              </p>
              <div className="flex gap-3 items-center flex-wrap">
                <span
                  className="px-3 py-1.5 text-[10px] tracking-[0.3em] uppercase italic border border-accent text-accent"
                  style={enFont}
                >
                  {roleLabel.en} · {roleLabel.zh}
                </span>
                {role !== 'user' && (
                  <a
                    href="/admin"
                    className="px-4 py-1.5 text-[10px] tracking-[0.3em] uppercase italic border border-border-hard text-text-secondary hover:border-accent hover:text-accent transition-colors"
                    style={enFont}
                  >
                    Admin Panel →
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-px bg-border-subtle border border-border-subtle mb-14">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface-1 p-7 text-center">
                <div className="font-serif text-4xl md:text-5xl text-text-primary mb-3">{s.value}</div>
                <div
                  className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted"
                  style={enFont}
                >
                  {s.en} · {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border-subtle">
            {menu.map((item) => (
              <div
                key={item.title}
                className="border-b border-border-subtle py-6 group cursor-pointer flex items-center justify-between gap-6"
              >
                <div>
                  <p
                    className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-1"
                    style={enFont}
                  >
                    {item.en}
                  </p>
                  <h3 className="font-serif text-lg tracking-[0.1em] text-text-primary mb-1 group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary">{item.desc}</p>
                </div>
                <span className="text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
            ))}

            {/* 修改密码 —— 唯一已实现可交互的项，与 menu 视觉一致 */}
            <ChangePasswordCard />
          </div>

          <form action={signOut} className="pt-10">
            <button
              type="submit"
              className="w-full py-3 border border-border-hard text-text-secondary tracking-[0.3em] text-sm hover:border-accent hover:text-accent transition-colors"
            >
              退 出 登 录
            </button>
          </form>
        </div>
      </section>

      <footer className="py-10 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-sm tracking-[0.2em] text-text-primary">云上米轨</span>
            <span
              className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted"
              style={enFont}
            >
              Yunshang Migui
            </span>
          </div>
          <p
            className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted"
            style={enFont}
          >
            © 2026 · Dianyue Railway Digital Heritage Platform
          </p>
        </div>
      </footer>
    </main>
  );
}
