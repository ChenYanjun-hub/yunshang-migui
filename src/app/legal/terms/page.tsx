import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export const metadata = {
  title: '使用条款 · 云上米轨',
  description: '云上米轨数字文化遗产平台用户使用条款',
};

const LAST_UPDATED = '2026-05-23';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="pt-28 md:pt-32 pb-20 px-5 md:px-12">
        <article className="max-w-3xl mx-auto">
          <p
            className="text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.5em] uppercase italic text-accent mb-3 md:mb-4"
            style={enFont}
          >
            Terms of Service · 使用条款
          </p>
          <h1 className="font-serif text-3xl md:text-5xl tracking-[0.08em] md:tracking-[0.1em] text-text-primary mb-3 md:mb-4 leading-tight">
            使用条款
          </h1>
          <p className="text-[11px] tracking-[0.3em] italic text-text-muted mb-10 md:mb-14" style={enFont}>
            Last updated · {LAST_UPDATED}
          </p>

          <Section n="01" title="服务说明" en="Service">
            <p>
              「云上米轨」（以下简称"本平台"）是面向滇越铁路（米轨）文化遗产保护与传播的数字平台，提供史料藏馆、云游导览、光影展览、研学社区、南渡 AI 问答、文创商城等服务。
            </p>
            <p>
              本平台目前作为科研与教育用途运营，并在持续完善中。我们尽力保证服务的稳定性与准确性，但不对服务的不间断或绝对无错误作出承诺。
            </p>
          </Section>

          <Section n="02" title="账号注册与使用" en="Account">
            <p>
              注册账号即表示您已年满 14 周岁，或在监护人同意下使用本平台。注册时请提供真实的邮箱与昵称信息。
            </p>
            <p>
              您应妥善保管自己的账号与密码。因密码泄露导致的任何损失由您本人承担。如发现账号被盗用，请第一时间通过<Link href="/legal/contact" className="text-accent hover:underline">「联系我们」</Link>反馈，我们将协助处理。
            </p>
            <p>
              本平台有权在合理范围内核实您的账号信息真实性，并对违规账号采取警告、限权、封禁等措施。
            </p>
          </Section>

          <Section n="03" title="内容与知识产权" en="Intellectual Property">
            <p>
              <strong className="text-text-primary">平台内容</strong>：史料藏馆中的老照片、文献、地图、口述史等内容，部分版权归原藏馆、原作者或原出版机构所有，本平台仅作非营利性研究与展示。如您是版权持有人并对某条史料的展示有异议，请联系我们立刻处理。
            </p>
            <p>
              <strong className="text-text-primary">用户内容</strong>：您在研学社区发布的文字、图片等内容版权归您本人所有。您同意授予本平台一项非独占、可撤回、免费的许可，用于在本平台范围内展示、推荐与传播您的内容。
            </p>
            <p>
              未经本平台或原版权方书面授权，禁止以商业目的复制、转载、改编本平台展示的史料内容。
            </p>
          </Section>

          <Section n="04" title="禁止行为" en="Prohibited">
            <p>使用本平台时，您不得：</p>
            <ul className="list-disc list-outside ml-5 space-y-1.5">
              <li>发布违法、暴力、色情、仇恨、歧视或侵犯他人权益的内容</li>
              <li>发布与滇越铁路文化无明显关联的广告、垃圾信息或营销内容</li>
              <li>冒充他人身份、伪造史料、传播未经核实的虚假信息</li>
              <li>对平台进行未授权的爬取、攻击、逆向工程或拒绝服务行为</li>
              <li>滥用 AI 问答额度、自动化批量请求、绕过权限限制</li>
            </ul>
          </Section>

          <Section n="05" title="南渡 AI 使用说明" en="AI Disclaimer">
            <p>
              南渡 AI 基于大语言模型 + 馆藏史料检索（RAG）生成回答。尽管我们对引用史料的真实性负责，但 AI 的解读与综合可能存在偏差或不完整。重要决策请以原始史料与权威来源为准。
            </p>
            <p>
              您向 AI 提出的问题与对话记录可能用于改进系统效果（已脱敏）。请勿在 AI 对话中输入身份证号、银行卡等敏感个人信息。
            </p>
          </Section>

          <Section n="06" title="免责声明" en="Disclaimer">
            <p>
              本平台所展示的史料内容仅供学习与研究参考，不构成任何商业、法律、医疗或专业建议。
            </p>
            <p>
              因不可抗力（包括但不限于网络中断、电力故障、第三方服务商故障、政策变更等）导致的服务暂停或数据损失，本平台不承担赔偿责任，但会尽力恢复。
            </p>
          </Section>

          <Section n="07" title="条款变更" en="Changes">
            <p>
              我们可能根据法律法规或服务发展需要更新本条款，更新版本将在本页面发布，并标注「Last updated」日期。重大变更我们会通过站内消息或邮件通知。
            </p>
            <p>条款更新后您继续使用本平台，即视为接受新版条款。</p>
          </Section>

          <Section n="08" title="适用法律" en="Governing Law">
            <p>
              本条款的解释、适用与争议处理适用中华人民共和国法律。如发生争议，应通过友好协商解决；协商不成的，提交本平台运营方所在地有管辖权的人民法院处理。
            </p>
          </Section>

          <FooterNav />
        </article>
      </section>
    </main>
  );
}

/** 章节卡片：左侧编号印章 + 右侧标题 + 段落 */
function Section({
  n,
  title,
  en,
  children,
}: {
  n: string;
  title: string;
  en: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 md:mb-12">
      <div className="flex items-baseline gap-3 md:gap-4 mb-4 md:mb-5 pb-3 border-b border-border-subtle">
        <span
          className="shrink-0 text-[11px] md:text-[12px] tracking-[0.3em] italic text-cinnabar"
          style={enFont}
        >
          {n}
        </span>
        <h2 className="font-serif text-xl md:text-2xl tracking-[0.1em] text-text-primary">
          {title}
        </h2>
        <span
          className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase italic text-text-muted"
          style={enFont}
        >
          · {en}
        </span>
      </div>
      <div className="space-y-3 md:space-y-3.5 text-[14px] md:text-[15px] text-text-secondary leading-loose">
        {children}
      </div>
    </section>
  );
}

function FooterNav() {
  return (
    <div className="mt-14 md:mt-20 pt-8 border-t border-border-subtle flex flex-col sm:flex-row justify-between gap-4 text-sm">
      <Link href="/legal/privacy" className="text-text-secondary hover:text-accent transition-colors">
        → 查看隐私条款
      </Link>
      <Link href="/user/account" className="text-text-secondary hover:text-accent transition-colors">
        ← 返回账号设置
      </Link>
    </div>
  );
}
