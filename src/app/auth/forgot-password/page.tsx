'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { requestPasswordReset } from '../actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    const email = String(formData.get('email') ?? '').trim();
    startTransition(async () => {
      const res = await requestPasswordReset(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (res?.ok) {
        setSentEmail(email);
        setSent(true);
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
            Reset · 找回密码
          </p>
          <h1 className="font-serif text-2xl md:text-4xl tracking-[0.08em] md:tracking-[0.1em] text-text-primary mb-3 md:mb-4 leading-tight">
            重置米轨密码
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed mb-8 md:mb-10">
            输入注册邮箱，我们会发一封带链接的邮件给你。点击链接即可设置新密码。
          </p>

          {sent ? (
            <div className="border border-accent/40 bg-accent/[0.06] p-5 md:p-6">
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic text-accent mb-3"
                style={enFont}
              >
                Email Sent · 邮件已发送
              </p>
              <p className="font-serif text-lg text-text-primary mb-2 break-all">
                {sentEmail}
              </p>
              <p className="text-sm text-text-secondary leading-relaxed mb-5">
                请到该邮箱查收"<span className="text-accent">重置密码</span>"邮件并点击其中的链接。链接通常 1 小时内有效。
              </p>
              <p className="text-xs text-text-muted leading-relaxed">
                没收到？检查垃圾邮件；或 60 秒后重试。
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setSentEmail('');
                  }}
                  className="flex-1 py-2.5 text-xs tracking-[0.25em] border border-border-hard text-text-secondary hover:border-accent hover:text-accent transition-colors"
                >
                  换个邮箱
                </button>
                <Link
                  href="/auth/login"
                  className="flex-1 py-2.5 text-xs tracking-[0.25em] border border-accent text-accent hover:bg-accent hover:text-background transition-colors text-center"
                >
                  返回登录
                </Link>
              </div>
            </div>
          ) : (
            <form action={onSubmit} className="space-y-5">
              <div>
                <label
                  className="block text-[11px] tracking-[0.3em] uppercase text-text-muted mb-2"
                  style={enFont}
                >
                  Email · 注册邮箱
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent border border-border-hard px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 border-l-2 border-red-500 pl-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full py-3 bg-accent text-background font-serif tracking-[0.3em] text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {pending ? '发送中…' : '发 送 重 置 邮 件'}
              </button>

              <div className="flex justify-between text-sm text-text-muted pt-4">
                <Link href="/auth/login" className="hover:text-accent transition-colors">
                  ← 返回登录
                </Link>
                <Link href="/auth/register" className="hover:text-accent transition-colors">
                  立即注册 →
                </Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
