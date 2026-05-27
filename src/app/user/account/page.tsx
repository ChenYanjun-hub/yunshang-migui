import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { createClient } from '@/lib/supabase/server';
import ChangePasswordCard from '../ChangePasswordCard';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export const metadata = {
  title: '账号设置 · 个人中心 | 云上米轨',
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/user/account');

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, created_at')
    .eq('id', user.id)
    .single();

  const nickname = profile?.nickname ?? '米轨用户';
  const joinedYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="pt-28 md:pt-32 pb-20 px-5 md:px-12">
        <div className="max-w-2xl mx-auto">
          {/* 顶部档案条 + 标题 */}
          <p
            className="text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.5em] uppercase italic text-accent mb-3 md:mb-4"
            style={enFont}
          >
            Account · 账号设置
          </p>
          <h1 className="font-serif text-3xl md:text-5xl tracking-[0.08em] md:tracking-[0.1em] text-text-primary mb-3 md:mb-4 leading-tight">
            账号与安全
          </h1>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-10 md:mb-14">
            管理你的密码、个人信息与隐私设置。
          </p>

          {/* 当前账号 —— 只读概览 */}
          <div className="border border-border-subtle bg-surface-1/40 mb-8 md:mb-10">
            <div className="p-5 md:p-6">
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-3"
                style={enFont}
              >
                Current Account · 当前账号
              </p>

              <dl className="space-y-3 text-sm">
                <div className="flex items-baseline gap-4">
                  <dt
                    className="w-20 shrink-0 text-[11px] tracking-[0.3em] uppercase italic text-text-muted"
                    style={enFont}
                  >
                    Nickname
                  </dt>
                  <dd className="font-serif text-base text-text-primary">{nickname}</dd>
                </div>
                <div className="flex items-baseline gap-4">
                  <dt
                    className="w-20 shrink-0 text-[11px] tracking-[0.3em] uppercase italic text-text-muted"
                    style={enFont}
                  >
                    Email
                  </dt>
                  <dd className="text-text-primary break-all">{user.email}</dd>
                </div>
                <div className="flex items-baseline gap-4">
                  <dt
                    className="w-20 shrink-0 text-[11px] tracking-[0.3em] uppercase italic text-text-muted"
                    style={enFont}
                  >
                    Joined
                  </dt>
                  <dd className="italic text-text-secondary" style={enFont}>
                    {joinedYear}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* 安全 —— 修改密码（搬自 /user 的 ChangePasswordCard） */}
          <div className="border-t border-border-subtle">
            <p
              className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase italic text-cinnabar mt-6 mb-2"
              style={enFont}
            >
              Security · 安全
            </p>
            <ChangePasswordCard />
          </div>

          {/* 隐私与条款 */}
          <div className="border-t border-border-subtle mt-10 md:mt-12">
            <p
              className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase italic text-cinnabar mt-6 mb-3"
              style={enFont}
            >
              Legal · 隐私与条款
            </p>
            <Link
              href="/legal/terms"
              className="border-b border-border-subtle py-5 group cursor-pointer flex items-center justify-between gap-4"
            >
              <div>
                <p
                  className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-1"
                  style={enFont}
                >
                  Terms of Service
                </p>
                <h3 className="font-serif text-base md:text-lg tracking-[0.1em] text-text-primary group-hover:text-accent transition-colors">
                  使用条款
                </h3>
              </div>
              <span className="text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all">
                →
              </span>
            </Link>
            <Link
              href="/legal/privacy"
              className="border-b border-border-subtle py-5 group cursor-pointer flex items-center justify-between gap-4"
            >
              <div>
                <p
                  className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-1"
                  style={enFont}
                >
                  Privacy Policy
                </p>
                <h3 className="font-serif text-base md:text-lg tracking-[0.1em] text-text-primary group-hover:text-accent transition-colors">
                  隐私条款
                </h3>
              </div>
              <span className="text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all">
                →
              </span>
            </Link>
          </div>

          {/* 联系我们 */}
          <div className="mt-10 md:mt-12">
            <p
              className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase italic text-cinnabar mb-3"
              style={enFont}
            >
              Reach Us · 联系我们
            </p>
            <Link
              href="/legal/contact"
              className="border-y border-border-subtle py-5 group cursor-pointer flex items-center justify-between gap-4"
            >
              <div>
                <p
                  className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-1"
                  style={enFont}
                >
                  Contact
                </p>
                <h3 className="font-serif text-base md:text-lg tracking-[0.1em] text-text-primary group-hover:text-accent transition-colors">
                  联系我们
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  邮件 / 公众号 / 学术合作 · 紧急情况优先回复
                </p>
              </div>
              <span className="text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all">
                →
              </span>
            </Link>
          </div>

          {/* 占位区 —— 未来扩展 */}
          <div className="mt-10 md:mt-12 border-l-2 border-border-subtle pl-4 py-1">
            <p
              className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-1"
              style={enFont}
            >
              More Settings · 更多设置
            </p>
            <p className="text-xs text-text-muted leading-relaxed">
              昵称编辑 / 头像上传 / 邮箱绑定 / 数据导出 等设置项即将上线。
            </p>
          </div>

          {/* 返回 */}
          <div className="mt-10 md:mt-14">
            <Link
              href="/user"
              className="inline-flex items-center gap-2 text-sm tracking-[0.2em] text-text-secondary hover:text-accent transition-colors"
            >
              ← 返回个人中心
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
