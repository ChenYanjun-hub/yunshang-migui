import { ComingSoonHero } from '@/components/user/ComingSoonHero';

export const metadata = {
  title: '打卡记录 · 个人中心 | 云上米轨',
};

export default function CheckInsPage() {
  return (
    <ComingSoonHero
      zhTitle="打卡记录"
      enLabel="Trail Log"
      description="沿米轨 855 公里，每到一站留下你的足迹与时长，绘制你独属的旅行画像。"
      sealChar="迹"
      eta="Phase 3 · 2026 Q4"
      features={[
        '32 站点扫码 / GPS 自动打卡',
        '里程统计 · 走过 vs 未访的可视化',
        '生成个人专属"旅程长卷"分享图',
        '与好友拼图谁先集齐 32 站',
      ]}
      footnote="From Kunming to Hekou — every station leaves a footprint."
    />
  );
}
