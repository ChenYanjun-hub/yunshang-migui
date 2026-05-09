import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Next.js 16: middleware -> proxy
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 重要：刷新过期 token；不要在 getUser() 和返回 response 之间执行其他逻辑
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 受保护路由
  const protectedPaths = ['/user', '/admin'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 已登录用户访问 auth 页面跳转回个人中心
  if (pathname.startsWith('/auth/') && user) {
    const home = request.nextUrl.clone();
    home.pathname = '/user';
    home.search = '';
    return NextResponse.redirect(home);
  }

  return response;
}

// 只在需要鉴权的路由上跑，其他路由（如 /home）不经过 Supabase，
// 避免国内网络访问 supabase.co 超时拖慢全站。
export const config = {
  matcher: ['/user/:path*', '/admin/:path*', '/auth/:path*', '/community/new'],
};
