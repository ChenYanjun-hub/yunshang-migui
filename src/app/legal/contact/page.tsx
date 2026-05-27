import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export const metadata = {
  title: '联系我们 · 云上米轨',
  description: '云上米轨数字文化遗产平台联系方式',
};

const channels = [
  {
    icon: '邮',
    label: 'Email',
    title: '电子邮件',
    value: 'tmml1770998584@163.com',
    desc: '账号问题、合作建议、学术合作、版权异议 —— 我们承诺 3 个工作日内回复',
    href: 'mailto:tmml1770998584@163.com',
    partner: false,
  },
  {
    icon: '友',
    label: 'Partner WeChat',
    title: '合作伙伴公众号',
    value: '秘境云南',
    desc: '我们的合作伙伴公众号 · 关注「秘境云南」可同步了解云南更多深度文化、户外与人文探索内容',
    href: undefined,
    partner: true,
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="pt-28 md:pt-32 pb-20 px-5 md:px-12">
        <div className="max-w-3xl mx-auto">
          <p
            className="text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.5em] uppercase italic text-accent mb-3 md:mb-4"
            style={enFont}
          >
            Contact · 联系我们
          </p>
          <h1 className="font-serif text-3xl md:text-5xl tracking-[0.08em] md:tracking-[0.1em] text-text-primary mb-3 md:mb-4 leading-tight">
            写信给我们
          </h1>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-10 md:mb-14 max-w-xl">
            米轨穿越百年，故事仍在续写。无论你有意见、建议、史料贡献、合作意向，还是只想说声你好 ——
            我们都很期待。
          </p>

          {/* 三种联系渠道 */}
          <div className="space-y-4 md:space-y-5 mb-12 md:mb-16">
            {channels.map((c, i) => {
              const inner = (
                <>
                  {/* 印章 */}
                  <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 border border-cinnabar bg-cinnabar-soft flex items-center justify-center font-serif text-2xl md:text-3xl text-cinnabar">
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p
                        className="text-[10px] tracking-[0.4em] uppercase italic text-cinnabar"
                        style={enFont}
                      >
                        {String(i + 1).padStart(2, '0')} · {c.label}
                      </p>
                      {c.partner && (
                        <span
                          className="text-[9px] tracking-[0.25em] uppercase italic px-1.5 py-0.5 border border-migui-yellow text-migui-yellow bg-migui-yellow/[0.08]"
                          style={enFont}
                        >
                          Partner · 合作伙伴
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg md:text-xl tracking-[0.1em] text-text-primary mb-1.5">
                      {c.title}
                    </h3>
                    <p className="font-serif text-[14px] md:text-[15px] text-accent mb-2 break-all">
                      {c.value}
                    </p>
                    <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </>
              );
              const className =
                'group flex items-start gap-4 md:gap-5 border border-border-subtle bg-surface-1/40 p-5 md:p-6 transition-colors hover:border-accent/60';
              return c.href ? (
                <a key={c.label} href={c.href} className={className}>
                  {inner}
                </a>
              ) : (
                <div key={c.label} className={className}>
                  {inner}
                </div>
              );
            })}
          </div>

          {/* 团队信息 */}
          <div className="border-y border-border-subtle py-8 md:py-10 mb-10 md:mb-14">
            <p
              className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase italic text-text-muted mb-4 text-center"
              style={enFont}
            >
              About the Team · 关于我们
            </p>
            <p className="text-[14px] md:text-[15px] text-text-secondary leading-loose text-center max-w-xl mx-auto">
              「云上米轨」是一个面向滇越铁路文化遗产保护的数字化项目，由一支跨学科学生团队搭建并持续维护，欢迎对铁路史、地方文化、数字人文感兴趣的伙伴加入。
            </p>
          </div>

          {/* 反馈渠道说明 */}
          <div className="bg-surface-1/40 border-l-2 border-cinnabar pl-5 py-3 mb-10 md:mb-14">
            <p className="text-[13px] md:text-[14px] text-text-secondary leading-loose">
              <strong className="text-text-primary">紧急情况（账号被盗 / 内容侵权）</strong> 请发邮件至{' '}
              <a
                href="mailto:tmml1770998584@163.com"
                className="text-accent hover:underline"
              >
                tmml1770998584@163.com
              </a>{' '}
              并在邮件主题中标注「紧急」，我们会优先处理。
            </p>
          </div>

          {/* 返回 */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Link
              href="/user/account"
              className="flex-1 py-3 text-center text-sm tracking-[0.25em] border border-accent text-accent hover:bg-accent hover:text-background transition-colors"
            >
              ← 返 回 账 号 设 置
            </Link>
            <Link
              href="/home"
              className="flex-1 py-3 text-center text-sm tracking-[0.25em] border border-border-hard text-text-secondary hover:border-accent hover:text-accent transition-colors"
            >
              回 到 首 页
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
