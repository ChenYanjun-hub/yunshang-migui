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
