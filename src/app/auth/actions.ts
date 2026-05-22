'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AuthResult = { ok?: true; error?: string; redirect?: string };

export async function signInWithPassword(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirect') ?? '/user');

  if (!email || !password) return { error: '请输入邮箱和密码' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // 不在 server action 里 redirect()，避免 NEXT_REDIRECT 信号被 client 的
  // startTransition(async) 包装吞掉。让客户端拿到 ok 后用 router.push 跳。
  revalidatePath('/', 'layout');
  return { ok: true, redirect: redirectTo };
}

export async function signUpWithPassword(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const nickname = String(formData.get('nickname') ?? '').trim() || '米轨用户';

  if (!email || !password) return { error: '请输入邮箱和密码' };
  if (password.length < 6) return { error: '密码至少 6 位' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname } },
  });
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { ok: true, redirect: '/user' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

/* =========================================================
 * 密码找回 / 重置 / 修改 —— 三段流程
 *
 * 找回（未登录）：
 *   forgot-password 页输入邮箱 → requestPasswordReset → Supabase 发邮件
 *   用户点邮件链接 → /auth/confirm?code=xxx → exchangeCodeForSession
 *   设 cookie → 重定向到 /auth/reset-password
 *   reset-password 页输入新密码 → updatePasswordWithRecovery → updateUser
 *
 * 修改（已登录，在 /user 页面）：
 *   输入当前密码 + 新密码 → changePassword → signInWithPassword 校验
 *   通过后 updateUser
 * ========================================================= */

/** 站点根 URL —— 用于拼装邮件回跳地址 */
function getSiteUrl(): string {
  // 1. 显式环境变量（部署到不同环境时手动配）
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  // 2. Vercel 自动注入
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // 3. 本地兜底
  return 'http://localhost:3000';
}

/** 发送密码重置邮件 */
export async function requestPasswordReset(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { error: '请输入邮箱' };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // emailRedirectTo 在 supabase 验证 token 后跳到这里，附带 ?code=xxx
    // 由 /auth/confirm 路由处理 exchangeCodeForSession，再跳 reset-password
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/auth/reset-password`,
  });
  if (error) return { error: error.message };

  return { ok: true };
}

/** 用恢复 session 更新密码（用户已通过邮件链接进入恢复态） */
export async function updatePasswordWithRecovery(formData: FormData): Promise<AuthResult> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (!password || password.length < 6) return { error: '密码至少 6 位' };
  if (password !== confirm) return { error: '两次输入的密码不一致' };

  const supabase = await createClient();
  // 必须有 session 才能 updateUser；若用户未走邮件链接直接访问会失败
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: '会话已过期，请重新点击邮件链接' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { ok: true, redirect: '/user' };
}

/** 已登录用户修改密码 —— 需校验当前密码 */
export async function changePassword(formData: FormData): Promise<AuthResult> {
  const currentPassword = String(formData.get('currentPassword') ?? '');
  const newPassword = String(formData.get('newPassword') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (!currentPassword) return { error: '请输入当前密码' };
  if (!newPassword || newPassword.length < 6) return { error: '新密码至少 6 位' };
  if (newPassword !== confirm) return { error: '两次输入的新密码不一致' };
  if (newPassword === currentPassword) return { error: '新密码不能与当前密码相同' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: '未登录或会话异常' };

  // 用当前密码登一次，校验通过才允许改 —— 防别人趁离开电脑改密码
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) return { error: '当前密码不正确' };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };

  return { ok: true };
}
