import { ComingSoonHero } from '@/components/user/ComingSoonHero';

export const metadata = {
  title: '我的勋章 · 个人中心 | 云上米轨',
};

export default function StampsPage() {
  return (
    <ComingSoonHero
      zhTitle="我的勋章"
      enLabel="Digital Stamps"
      description="32 个站点徽章 + 稀有电子印章。每一次打卡、每一次完整研学，都铸成一枚专属勋章。"
      sealChar="章"
      eta="Phase 3 · 2026 Q4"
      features={[
        '32 站点专属徽章 · 集齐解锁"全线"超级勋章',
        '稀有印章 · 限时活动 / 特殊路线奖励',
        '勋章墙展示 · 长按可生成头像装饰',
        '区块链可验证（远期）',
      ]}
      footnote="Each stamp is a paragraph of your own railway chronicle."
    />
  );
}
