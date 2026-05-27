import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export const metadata = {
  title: '隐私条款 · 云上米轨',
  description: '云上米轨数字文化遗产平台隐私保护政策',
};

const LAST_UPDATED = '2026-05-23';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="pt-28 md:pt-32 pb-20 px-5 md:px-12">
        <article className="max-w-3xl mx-auto">
          <p
            className="text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.5em] uppercase italic text-accent mb-3 md:mb-4"
            style={enFont}
          >
            Privacy Policy · 隐私条款
          </p>
          <h1 className="font-serif text-3xl md:text-5xl tracking-[0.08em] md:tracking-[0.1em] text-text-primary mb-3 md:mb-4 leading-tight">
            隐私条款
          </h1>
          <p className="text-[11px] tracking-[0.3em] italic text-text-muted mb-10 md:mb-14" style={enFont}>
            Last updated · {LAST_UPDATED}
          </p>

          <p className="text-[14px] md:text-[15px] text-text-secondary leading-loose mb-10 md:mb-14 border-l-2 border-cinnabar pl-4 italic">
            我们尊重并致力于保护您的个人信息。本条款说明我们收集哪些信息、为何收集、如何使用与保存，以及您拥有哪些权利。
          </p>

          <Section n="01" title="我们收集的信息" en="What We Collect">
            <p><strong className="text-text-primary">注册信息</strong>：邮箱地址、昵称、头像（可选）。</p>
            <p><strong className="text-text-primary">用户内容</strong>：您在研学社区发布的文字、图片，以及您向南渡 AI 提出的问题与对话记录。</p>
            <p><strong className="text-text-primary">行为日志</strong>：浏览历史、点击事件、IP 地址、浏览器 / 设备类型，用于优化体验与排查故障（保留期 90 天）。</p>
            <p><strong className="text-text-primary">我们不会收集</strong>：身份证号、银行卡、手机号、住址等敏感个人信息。如未来需要，会单独征得您的明确同意。</p>
          </Section>

          <Section n="02" title="信息如何使用" en="How We Use">
            <ul className="list-disc list-outside ml-5 space-y-1.5">
              <li>账号登录与身份识别</li>
              <li>展示您发布的内容、个人收藏与打卡足迹</li>
              <li>南渡 AI 检索增强与个性化推荐</li>
              <li>服务异常排查、性能优化、防滥用检测</li>
              <li>在您主动同意时，发送账号通知、史料新增提醒、活动信息</li>
            </ul>
          </Section>

          <Section n="03" title="数据存储与跨境" en="Storage">
            <p>
              您的账号与内容数据存储于 <strong className="text-text-primary">Supabase 日本东京节点</strong>，由 Supabase（一家美国云服务商）运营，遵循其安全与合规承诺。
            </p>
            <p>
              由于本平台目前作为研究与教育用途运营，尚未完成 ICP 备案，因此暂时使用境外服务节点。我们承诺：
            </p>
            <ul className="list-disc list-outside ml-5 space-y-1.5">
              <li>不主动向境外第三方共享您的个人信息</li>
              <li>仅必要的服务依赖（如下方第 04 节列出）会接触到必要的数据片段</li>
              <li>未来完成备案后，会将数据迁移至中国大陆节点</li>
            </ul>
          </Section>

          <Section n="04" title="第三方服务" en="Third Parties">
            <p>本平台为提供服务，依赖以下第三方组件，它们会按需接触必要数据：</p>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li>
                <strong className="text-text-primary">Supabase</strong>（数据库 / 鉴权 / 文件存储）—— 接触全部账号与内容数据
              </li>
              <li>
                <strong className="text-text-primary">DeepSeek</strong>（大语言模型）—— 仅接触您向南渡 AI 提出的问题文本与召回的史料片段
              </li>
              <li>
                <strong className="text-text-primary">阿里云通义千问 DashScope</strong>（文本向量化）—— 仅接触您输入文本的向量化表示
              </li>
              <li>
                <strong className="text-text-primary">高德地图</strong>（瓦片底图）—— 接触您访问云游导览页面时的地图区域请求
              </li>
            </ul>
            <p>我们已尽力选择有隐私承诺的服务商。各方的隐私政策请参阅其官方文档。</p>
          </Section>

          <Section n="05" title="您的权利" en="Your Rights">
            <p>作为用户，您拥有以下权利：</p>
            <ul className="list-disc list-outside ml-5 space-y-1.5">
              <li><strong className="text-text-primary">访问</strong>：查看您账号下的所有数据</li>
              <li><strong className="text-text-primary">更正</strong>：在「账号设置」中修改昵称、密码等</li>
              <li><strong className="text-text-primary">删除</strong>：申请注销账号 + 删除全部内容（通过<Link href="/legal/contact" className="text-accent hover:underline">联系我们</Link>提交）</li>
              <li><strong className="text-text-primary">撤回授权</strong>：随时退出登录或删除特定内容</li>
              <li><strong className="text-text-primary">投诉</strong>：对我们的信息处理方式有异议时，可向我们或当地监管机关投诉</li>
            </ul>
            <p>我们承诺在收到权利请求后 <strong className="text-text-primary">15 个工作日内</strong>回复。</p>
          </Section>

          <Section n="06" title="Cookies 与本地存储" en="Cookies">
            <p>
              本平台仅使用 <strong className="text-text-primary">必要 Cookies</strong>（Supabase 鉴权 session）维持登录状态，不使用任何第三方广告追踪 Cookies。
            </p>
            <p>
              本地存储用于记住您的偏好（例如「Tier 3 横屏提示」是否已关闭），数据仅存于您的浏览器，不上传到服务器。
            </p>
          </Section>

          <Section n="07" title="未成年人保护" en="Minors">
            <p>
              本平台主要面向研学旅人、文化爱好者与高校师生。未满 14 周岁的儿童不应自行注册使用本平台。如发现儿童在未经监护人同意的情况下注册，请<Link href="/legal/contact" className="text-accent hover:underline">联系我们</Link>立即处理。
            </p>
          </Section>

          <Section n="08" title="条款变更" en="Changes">
            <p>
              我们可能根据法律法规或服务发展更新本条款，更新版本将在本页面发布并标注「Last updated」日期。重大变更我们会通过站内消息或邮件通知。
            </p>
          </Section>

          <Section n="09" title="联系我们" en="Contact">
            <p>
              对本条款有任何疑问、建议或权利请求，请通过<Link href="/legal/contact" className="text-accent hover:underline">「联系我们」</Link>页面与我们联系。
            </p>
          </Section>

          <FooterNav />
        </article>
      </section>
    </main>
  );
}

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
      <Link href="/legal/terms" className="text-text-secondary hover:text-accent transition-colors">
        → 查看使用条款
      </Link>
      <Link href="/user/account" className="text-text-secondary hover:text-accent transition-colors">
        ← 返回账号设置
      </Link>
    </div>
  );
}
