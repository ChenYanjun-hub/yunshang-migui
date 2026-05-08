'use client';

import { useTransition } from 'react';
import { setUserRole } from './actions';

const ROLES = [
  { v: 'user', label: '普通用户' },
  { v: 'admin_product', label: '产品部' },
  { v: 'admin_tech', label: '技术部' },
  { v: 'admin_ops', label: '运营部' },
  { v: 'admin_biz', label: '商务部' },
  { v: 'super_admin', label: '超级管理员' },
];

export default function RoleSelect({
  userId, currentRole, isSelf,
}: {
  userId: string; currentRole: string; isSelf: boolean;
}) {
  const [pending, start] = useTransition();

  function onChange(role: string) {
    if (role === currentRole) return;
    start(async () => {
      try { await setUserRole(userId, role); } catch (e) { alert((e as Error).message); }
    });
  }

  return (
    <select
      defaultValue={currentRole}
      disabled={pending}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent border border-border-hard px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent disabled:opacity-50"
      title={isSelf ? '当前账号' : ''}
    >
      {ROLES.map((r) => (
        <option key={r.v} value={r.v}>{r.label}{isSelf ? ' · 你' : ''}</option>
      ))}
    </select>
  );
}
