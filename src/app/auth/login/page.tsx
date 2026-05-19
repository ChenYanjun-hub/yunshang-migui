'use client';

import { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { signInWithPassword } from '../actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/user';
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set('redirect', redirectTo);
    startTransition(async () => {
      const res = await signInWithPassword(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (res?.ok) {
        // server action 已写好 cookie + revalidatePath，这里客户端跳页
        router.replace(res.redirect ?? '/user');
        router.refresh();
      }
    });
  }

  return (
    <section className="pt-32 pb-20 px-6 md:px-12">
      <div className="max-w-md mx-auto">
        <p
          className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4"
          style={enFont}
        >
          Sign In · 登录
        </p>
        <h1 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-text-primary mb-10">
          欢迎回到米轨
        </h1>

        <div className="flex border-b border-border-subtle mb-8">
          <button
            type="button"
            onClick={() => setTab('email')}
            className={`flex-1 py-3 text-sm tracking-[0.2em] transition-colors ${
              tab === 'email'
                ? 'text-accent border-b border-accent -mb-px'
                : 'text-text-muted'
            }`}
          >
            邮箱登录
          </button>
          <button
            type="button"
            onClick={() => setTab('phone')}
            className={`flex-1 py-3 text-sm tracking-[0.2em] transition-colors ${
              tab === 'phone'
                ? 'text-accent border-b border-accent -mb-px'
                : 'text-text-muted'
            }`}
          >
            手机登录
          </button>
        </div>

        {tab === 'email' ? (
          <form action={onSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] tracking-[0.3em] uppercase text-text-muted mb-2" style={enFont}>
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full bg-transparent border border-border-hard px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.3em] uppercase text-text-muted mb-2" style={enFont}>
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-transparent border border-border-hard px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 border-l-2 border-red-500 pl-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 bg-accent text-background font-serif tracking-[0.3em] text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {pending ? '登录中…' : '登 录'}
            </button>

            <p className="text-center text-sm text-text-muted pt-4">
              还没有账号？{' '}
              <Link href="/auth/register" className="text-accent hover:underline">
                立即注册
              </Link>
            </p>
          </form>
        ) : (
          <div className="border border-dashed border-border-subtle p-8 text-center">
            <p className="text-text-muted text-sm leading-relaxed">
              手机号 + 验证码登录通道筹备中
              <br />
              <span className="text-xs italic" style={enFont}>
                Phone OTP coming soon
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
