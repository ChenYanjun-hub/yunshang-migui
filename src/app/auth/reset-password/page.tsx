'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { updatePasswordWithRecovery } from '../actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updatePasswordWithRecovery(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (res?.ok) {
        // 设新密码后已是登录态，直接进个人中心
        router.replace(res.redirect ?? '/user');
        router.refresh();
      }
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />
      <section className="pt-28 md:pt-32 pb-20 px-5 md:px-12">
        <div className="max-w-md mx-auto">
          <p
            className="text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.5em] uppercase italic text-accent mb-3 md:mb-4"
            style={enFont}
          >
            New Password · 设置新密码
          </p>
          <h1 className="font-serif text-2xl md:text-4xl tracking-[0.08em] md:tracking-[0.1em] text-text-primary mb-3 md:mb-4 leading-tight">
            重新铺设你的密码
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed mb-8 md:mb-10">
            设置新密码后将自动登录。密码至少 6 位，建议使用字母 + 数字组合。
          </p>

          <form action={onSubmit} className="space-y-5">
            <div>
              <label
                className="block text-[11px] tracking-[0.3em] uppercase text-text-muted mb-2"
                style={enFont}
              >
                New Password · 新密码
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
            <div>
              <label
                className="block text-[11px] tracking-[0.3em] uppercase text-text-muted mb-2"
                style={enFont}
              >
                Confirm · 再次确认
              </label>
              <input
                name="confirm"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full bg-transparent border border-border-hard px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <div className="border-l-2 border-red-500 pl-3 py-1">
                <p className="text-sm text-red-500">{error}</p>
                {error.includes('过期') && (
                  <p className="text-xs text-text-muted mt-1">
                    <Link href="/auth/forgot-password" className="text-accent hover:underline">
                      重新发一封邮件 →
                    </Link>
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 bg-accent text-background font-serif tracking-[0.3em] text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {pending ? '更新中…' : '更 新 密 码'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
