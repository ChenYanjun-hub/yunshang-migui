import { ComingSoonHero } from '@/components/user/ComingSoonHero';

export const metadata = {
  title: '会员权益 · 个人中心 | 云上米轨',
};

export default function VipPage() {
  return (
    <ComingSoonHero
      zhTitle="会员权益"
      enLabel="VIP Benefits"
      description="成为「云上米轨」会员，解锁百年档案的高清原貌、专属研学路线与文创权益。"
      sealChar="贵"
      eta="Phase 3 · 2026 Q2"
      features={[
        '史料藏馆 · 无水印高清原图下载（普通用户为带印水印预览）',
        '南渡 AI · 月度问答额度从 30 条提升至 200 条',
        '研学路线 · VIP 专属定制路线 / 优先名额',
        '文创商城 · 全场 8 折 + 限定款优先购',
        '勋章 · 专属"米轨同行人"金边徽章',
      ]}
      footnote="The full chronicle — unsealed, in your hands."
    />
  );
}
