import { ComingSoonHero } from '@/components/user/ComingSoonHero';

export const metadata = {
  title: '我的收藏 · 个人中心 | 云上米轨',
};

export default function CollectedPage() {
  return (
    <ComingSoonHero
      zhTitle="我的收藏"
      enLabel="Collected Records"
      description="把珍贵的史料、站点与展览一键归入你的私人档案柜，随时回来翻阅。"
      sealChar="藏"
      eta="Phase 3 · 2026 Q3"
      features={[
        '史料 / 站点 / 帖子 / 商品 一键收藏到个人档案',
        '按时期 / 类型 / 标签自由归档',
        '导出 PDF 个人专属史料册',
        '与好友分享收藏夹链接',
      ]}
      footnote="A private cabinet for the stories you wish to keep."
    />
  );
}
