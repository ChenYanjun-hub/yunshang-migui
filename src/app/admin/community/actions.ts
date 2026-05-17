'use server';

/**
 * admin/community server actions
 *
 * 为何独立于 src/app/community/actions.ts：
 *   - 用户侧 actions 走 cookie createClient + RLS（作者本人写自己的帖）
 *   - admin 操作（隐藏他人帖、删评论）需要绕过 RLS，用 service role
 *   - 演示前不动数据库 RLS policy；service role 走代码层 + admin 路由守卫（layout
 *     已校验 role in admin_ops / super_admin），双重保险
 *
 * 注意：deletePost 在用户侧 community/actions.ts 已有，但那个 redirect 到
 * /community；admin 侧需要原地刷新列表，所以重写 deletePostAdmin。
 */

import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const ALLOWED_POST_STATUS = ['visible', 'hidden'] as const;
type PostStatus = (typeof ALLOWED_POST_STATUS)[number];

/** service role 客户端：绕过 RLS。仅 admin 侧调用 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

/** admin 身份校验：未授权直接抛错，避免越权 */
async function assertAdmin() {
  const sb = await createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('未登录');

  const { data: profile } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin_ops', 'super_admin'].includes(profile.role as string)) {
    throw new Error('权限不足（需要 admin_ops 或 super_admin）');
  }
}

/** 切换帖子可见性 */
export async function setPostStatus(id: string, status: PostStatus) {
  await assertAdmin();
  if (!ALLOWED_POST_STATUS.includes(status)) throw new Error('状态非法');

  const sb = getServiceClient();
  const { error } = await sb
    .from('posts')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/community');
  revalidatePath('/community');
  revalidatePath(`/community/${id}`);
}

/** 管理员删帖（不 redirect，停留在 admin 列表） */
export async function deletePostAdmin(id: string) {
  await assertAdmin();
  const sb = getServiceClient();

  // FK CASCADE 应自动清子表，但显式做一遍更稳（postgres 配置不一定都开 cascade）
  await sb.from('comments').delete().eq('post_id', id);
  await sb.from('post_likes').delete().eq('post_id', id);

  const { error } = await sb.from('posts').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/community');
  revalidatePath('/community');
}

/** 管理员删评论 */
export async function deleteCommentAdmin(commentId: string, postId: string) {
  await assertAdmin();
  const sb = getServiceClient();

  const { error } = await sb.from('comments').delete().eq('id', commentId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/community');
  revalidatePath('/community');
  revalidatePath(`/community/${postId}`);
}
