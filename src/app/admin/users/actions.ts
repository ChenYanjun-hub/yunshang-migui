'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_ROLES = [
  'user', 'admin_product', 'admin_tech', 'admin_ops', 'admin_biz', 'super_admin',
];

export async function setUserRole(userId: string, role: string) {
  if (!ALLOWED_ROLES.includes(role)) throw new Error('角色非法');

  const supabase = await createClient();
  const { data: { user: me } } = await supabase.auth.getUser();
  if (!me) throw new Error('未登录');

  // 仅 super_admin 可改角色
  const { data: meProfile } = await supabase
    .from('profiles').select('role').eq('id', me.id).single();
  if (meProfile?.role !== 'super_admin') throw new Error('仅超级管理员可操作');

  // 不允许把自己降级
  if (userId === me.id && role !== 'super_admin') {
    throw new Error('请勿降级自己的账号');
  }

  const { error } = await supabase.from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/users');
}
