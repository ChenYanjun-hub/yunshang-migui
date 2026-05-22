import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 邮件链接回跳处理器
 *
 * Supabase 给用户的邮件链接形如：
 *   {SUPABASE_URL}/auth/v1/verify?token=xxx&type=recovery&redirect_to={SITE}/auth/confirm?next=/auth/reset-password
 *
 * Supabase 验证 token 后会 302 到我们的 redirect_to，并在 query 中带 ?code=xxx（PKCE 流程）
 * 这里：
 *   1. 拿 code 调 exchangeCodeForSession 设 cookie
 *   2. 跳到 next（默认 /auth/reset-password）
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/user';

  if (!code) {
    // 没 code 说明链接被截断或过期，引导回登录页
    return NextResponse.redirect(`${origin}/auth/login?error=link_invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  // session 已写入 cookie，跳到目标页（一般是 reset-password）
  return NextResponse.redirect(`${origin}${next}`);
}
