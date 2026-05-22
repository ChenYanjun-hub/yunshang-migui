'use client';

import { useState, useTransition } from 'react';
import { changePassword } from '../auth/actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

/**
 * 已登录态下修改密码 —— 折叠卡片
 * 服务端 changePassword 会用当前密码再 signInWithPassword 一次做校验，
 * 通过后才 updateUser。失败不会影响当前登录状态。
 */
export default function ChangePasswordCard() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await changePassword(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (res?.ok) {
        setSuccess(true);
        // 自动收起表单（保留成功提示 4 秒）
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
        }, 4000);
      }
    });
  }

  return (
    <div className="border-b border-border-subtle">
      {/* 折叠头 —— 复用 menu 行的视觉 */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setError(null);
          setSuccess(false);
        }}
        className="w-full py-6 group flex items-center justify-between gap-6 text-left"
      >
        <div>
          <p
            className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-1"
            style={enFont}
          >
            Change Password
          </p>
          <h3 className="font-serif text-lg tracking-[0.1em] text-text-primary mb-1 group-hover:text-accent transition-colors">
            修改密码
          </h3>
          <p className="text-xs text-text-secondary">
            校验当前密码后更新为新密码 · 至少 6 位
          </p>
        </div>
        <span
          className={`text-text-muted group-hover:text-accent transition-transform duration-300
            ${open ? 'rotate-90' : 'rotate-0'}`}
        >
          →
        </span>
      </button>

      {/* 展开表单 */}
      {open && (
        <form
          action={onSubmit}
          className="pb-6 pt-2 space-y-4 animate-[lightbox-in_240ms_ease-out]"
        >
          <div>
            <label
              className="block text-[11px] tracking-[0.3em] uppercase text-text-muted mb-2"
              style={enFont}
            >
              Current Password · 当前密码
            </label>
            <input
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-transparent border border-border-hard px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label
              className="block text-[11px] tracking-[0.3em] uppercase text-text-muted mb-2"
              style={enFont}
            >
              New Password · 新密码 (≥ 6 位)
            </label>
            <input
              name="newPassword"
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
            <p className="text-sm text-red-500 border-l-2 border-red-500 pl-3">
              {error}
            </p>
          )}

          {success && (
            <p
              className="text-sm text-accent border-l-2 border-accent pl-3"
              style={enFont}
            >
              ✓ 密码已更新 · Password updated
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
                setSuccess(false);
              }}
              className="flex-1 py-2.5 text-xs tracking-[0.25em] border border-border-hard text-text-secondary hover:border-accent hover:text-accent transition-colors"
            >
              取 消
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 text-xs tracking-[0.25em] bg-accent text-background hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {pending ? '更新中…' : '更 新 密 码'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
