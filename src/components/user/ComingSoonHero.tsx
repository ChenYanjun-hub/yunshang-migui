import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { createClient } from '@/lib/supabase/server';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

interface ComingSoonHeroProps {
  /** 主标题：例 "我的勋章" */
  zhTitle: string;
  /** 英文标签：例 "Digital Stamps" */
  enLabel: string;
  /** 一句话描述：例 "32 站徽章与稀有电子印章" */
  description: string;
  /** 站印章里的中文单字：例 "章" */
  sealChar: string;
  /** 可选：即将上线的功能列表 */
  features?: string[];
  /** 可选：上线阶段，例 "Phase 3 · 2026 Q3" */
  eta?: string;
  /** 可选：底部备注 */
  footnote?: string;
}

/**
 * 「敬请期待」统一页 —— 沿用项目印章 + 朱砂 + 米黄美学
 *
 * 注意：内嵌了 auth 检查 —— 调用 createClient/getUser 让页面成为动态渲染，
 * 否则 Next.js 16 会把 Coming Soon 页静态预渲染，proxy 不拦截，
 * 未登录用户能直接看到这些页面（虽然没敏感数据，但绕过了守卫）。
 */
export async function ComingSoonHero({
  zhTitle,
  enLabel,
  description,
  sealChar,
  features,
  eta,
  footnote,
}: ComingSoonHeroProps) {
  // 强制动态 + 守卫未登录用户
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // 通过 hero 调用方的路径回跳登录
    redirect('/auth/login?redirect=/user');
  }

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="pt-28 md:pt-32 pb-20 px-5 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* 顶部档案条 */}
          <p
            className="archive-label text-cinnabar mb-6 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-typewriter)' }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cinnabar" />
            <span>FORTHCOMING · 敬请期待</span>
          </p>

          {/* 印章 + 标题区 —— 印章左、标题右，移动端栈式 */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8 mb-10 md:mb-14 pb-10 md:pb-12 border-b border-border-subtle">
            {/* 印章 */}
            <div className="shrink-0">
              <div
                className="w-20 h-20 md:w-28 md:h-28 border-2 border-cinnabar bg-cinnabar-soft
                           flex items-center justify-center
                           font-serif text-4xl md:text-6xl text-cinnabar
                           shadow-[0_2px_8px_rgba(168,52,32,0.12)]"
              >
                {sealChar}
              </div>
            </div>

            {/* 标题块 */}
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.5em] uppercase italic text-accent mb-2 md:mb-3"
                style={enFont}
              >
                {enLabel}
              </p>
              <h1 className="font-serif text-3xl md:text-5xl tracking-[0.08em] md:tracking-[0.1em] text-text-primary mb-3 md:mb-4 leading-tight">
                {zhTitle}
              </h1>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* 大字"敬请期待" + 英文双行 */}
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-serif text-5xl md:text-7xl tracking-[0.12em] text-text-primary leading-none mb-4 md:mb-5">
              敬请期待
            </h2>
            <p
              className="text-base md:text-xl italic text-text-secondary tracking-wider"
              style={enFont}
            >
              Coming Soon
            </p>
            {eta && (
              <p
                className="inline-block mt-5 md:mt-6 px-3 py-1.5 text-[10px] md:text-[11px] tracking-[0.3em] uppercase italic
                           border border-accent text-accent bg-accent/[0.06]"
                style={enFont}
              >
                {eta}
              </p>
            )}
          </div>

          {/* 功能预告列表 —— 可选 */}
          {features && features.length > 0 && (
            <div className="border-y border-border-subtle py-8 md:py-10 mb-10 md:mb-14">
              <p
                className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase italic text-text-muted mb-5 md:mb-6 text-center"
                style={enFont}
              >
                What&apos;s Coming · 上线后包含
              </p>
              <ul className="list-none space-y-3 md:space-y-4 max-w-xl mx-auto">
                {features.map((f, i) => (
                  <li key={i} className="flex items-baseline gap-3">
                    <span
                      className="shrink-0 text-[10px] tracking-[0.3em] italic text-cinnabar"
                      style={enFont}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[14px] md:text-[15px] text-text-primary leading-relaxed font-serif">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 底部备注 */}
          {footnote && (
            <p
              className="text-xs text-text-muted text-center italic leading-relaxed mb-8 md:mb-10 max-w-xl mx-auto"
              style={enFont}
            >
              {footnote}
            </p>
          )}

          {/* 返回按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Link
              href="/user"
              className="flex-1 py-3 text-center text-sm tracking-[0.25em] border border-accent text-accent
                         hover:bg-accent hover:text-background transition-colors"
            >
              ← 返 回 个 人 中 心
            </Link>
            <Link
              href="/home"
              className="flex-1 py-3 text-center text-sm tracking-[0.25em] border border-border-hard text-text-secondary
                         hover:border-accent hover:text-accent transition-colors"
            >
              回 到 首 页
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
