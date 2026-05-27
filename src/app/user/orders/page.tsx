import { ComingSoonHero } from '@/components/user/ComingSoonHero';

export const metadata = {
  title: '订单管理 · 个人中心 | 云上米轨',
};

export default function OrdersPage() {
  return (
    <ComingSoonHero
      zhTitle="订单管理"
      enLabel="Orders"
      description="文创商品订单、研学路线预约、VIP 续费记录 —— 一处统管，发货到家。"
      sealChar="单"
      eta="Phase 3 · 2026 Q3"
      features={[
        '文创商城商品订单 · 物流状态实时同步',
        '研学路线预约 · 行程单 / 票据下载',
        'VIP 会员续费 / 升级记录',
        '退换货申请 · 在线发起 · 客服跟进',
      ]}
      footnote="Receipts, parcels and trail tickets — all in one place."
    />
  );
}
