'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { signUpWithPassword } from '../actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await signUpWithPassword(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-md mx-auto">
          <p
            className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4"
            style={enFont}
          >
            Sign Up · 注册
          </p>
          <h1 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-text-primary mb-10">
            加入米轨旅人
          </h1>

          <form action={onSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] tracking-[0.3em] uppercase text-text-muted mb-2" style={enFont}>
                Nickname · 昵称
              </label>
              <input
                name="nickname"
                type="text"
                maxLength={20}
                placeholder="米轨旅人"
                className="w-full bg-transparent border border-border-hard px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
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
                Password · 至少 6 位
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
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
              {pending ? '创建中…' : '创 建 账 号'}
            </button>

            <p className="text-center text-sm text-text-muted pt-4">
              已有账号？{' '}
              <Link href="/auth/login" className="text-accent hover:underline">
                直接登录
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
