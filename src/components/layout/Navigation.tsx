'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

type NavLink = { href: string; label: string; en: string; accent?: boolean };

const links: NavLink[] = [
  { href: '/archive', label: '史料藏馆', en: 'Archive' },
  { href: '/cloud-tour', label: '云游导览', en: 'Cloud Tour' },
  { href: '/exhibition', label: '光影展览', en: 'Exhibition' },
  { href: '/community', label: '研学社区', en: 'Community' },
  { href: '/ai', label: '南渡 AI', en: 'Nandu AI', accent: true },
  { href: '/store', label: '文创商城', en: 'Store' },
];

// 在 Tier 3 三页（移动端未做精修）顶部挂提示条，引导观众用桌面/横屏访问
const TIER3_PATHS = new Set(['/exhibition', '/community', '/store']);

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tier3NoticeDismissed, setTier3NoticeDismissed] = useState(false);

  // sessionStorage 记住"本次会话已关闭"，刷新页面会重新提示
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (sessionStorage.getItem('tier3-notice-dismissed') === '1') {
        setTier3NoticeDismissed(true);
      }
    } catch {
      /* sessionStorage 不可用时静默忽略 */
    }
  }, []);

  const showTier3Notice = TIER3_PATHS.has(pathname) && !tier3NoticeDismissed;
  const dismissTier3Notice = () => {
    setTier3NoticeDismissed(true);
    try {
      sessionStorage.setItem('tier3-notice-dismissed', '1');
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 路由切换自动关闭抽屉
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // 抽屉打开时锁 body 滚动 + 监听 ESC
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1100] transition-[background-color,border-color,backdrop-filter] duration-500
          ${scrolled
            ? 'bg-background/85 backdrop-blur-md border-b border-border-subtle'
            : 'bg-gradient-to-b from-background/85 to-transparent border-b border-transparent'}
          px-5 py-3.5 md:px-12 md:py-5 flex justify-between items-center`}
      >
        <Link
          href="/home"
          className="flex items-baseline gap-2 md:gap-3 group"
          onClick={() => setMenuOpen(false)}
        >
          <span className="font-serif text-lg md:text-2xl tracking-[0.18em] md:tracking-[0.2em] text-text-primary group-hover:text-accent transition-colors">
            云上米轨
          </span>
          <span
            className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted hidden sm:block"
            style={enFont}
          >
            Yunshang Migui
          </span>
        </Link>

        {/* 桌面：横向导航 */}
        <ul className="hidden md:flex gap-8 list-none items-center">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative group inline-flex flex-col items-center px-3 py-1.5 transition-all duration-300
                    ${active
                      ? `${link.accent ? 'text-cinnabar' : 'text-migui-yellow'} bg-surface-1 border border-border-subtle shadow-[0_1px_0_rgba(20,17,13,0.04)]`
                      : (link.accent ? 'text-cinnabar/85 hover:text-cinnabar border border-transparent' : 'text-text-secondary hover:text-text-primary border border-transparent')}`}
                >
                  <span className="text-sm tracking-[0.2em]">{link.label}</span>
                  <span
                    className="text-[9px] tracking-[0.4em] uppercase italic mt-0.5 opacity-60"
                    style={enFont}
                  >
                    {link.en}
                  </span>
                  {!active && (
                    <span
                      className={`absolute -bottom-0.5 left-3 right-3 mx-auto h-px transition-all duration-300
                        w-0 ${link.accent ? 'bg-cinnabar' : 'bg-accent'} group-hover:w-[calc(100%-1.5rem)]`}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 桌面：用户中心 */}
        <Link
          href="/user"
          className="hidden md:flex ml-0 w-10 h-10 border border-border-hard hover:border-accent hover:text-accent
                     text-text-secondary items-center justify-center font-serif text-sm tracking-wider
                     transition-colors"
          aria-label="个人中心"
        >
          旅
        </Link>

        {/* 移动端：汉堡按钮 */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
          className="md:hidden relative w-10 h-10 border border-border-hard text-text-primary
                     flex items-center justify-center hover:border-accent hover:text-accent
                     transition-colors"
        >
          <span
            className={`absolute left-2 right-2 h-px bg-current transition-all duration-300
              ${menuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[12px]'}`}
          />
          <span
            className={`absolute left-2 right-2 h-px bg-current top-1/2 -translate-y-1/2 transition-opacity duration-200
              ${menuOpen ? 'opacity-0' : 'opacity-100'}`}
          />
          <span
            className={`absolute left-2 right-2 h-px bg-current transition-all duration-300
              ${menuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-[12px]'}`}
          />
        </button>
      </nav>

      {/* Tier 3 移动端提示条 —— 跟随 Nav 紧贴下方、仅 mobile 显示、可关闭 */}
      {showTier3Notice && (
        <div
          className="md:hidden fixed top-[57px] left-0 right-0 z-[1095]
                     bg-cinnabar-soft border-b border-cinnabar/40
                     flex items-center gap-2 px-4 py-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cinnabar shrink-0" />
          <p className="text-[11px] tracking-wide text-text-primary leading-snug flex-1">
            此页面针对桌面端优化，移动端建议横屏或电脑访问以获得完整体验
          </p>
          <button
            type="button"
            onClick={dismissTier3Notice}
            aria-label="关闭提示"
            className="shrink-0 w-6 h-6 flex items-center justify-center text-cinnabar/70 hover:text-cinnabar text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* 移动端：全屏抽屉。z=1090 在 nav(1100) 之下，让顶部叉号始终可点 */}
      <div
        id="mobile-nav-drawer"
        className={`md:hidden fixed inset-0 z-[1090] transition-opacity duration-300
          ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!menuOpen}
      >
        {/* 背景遮罩 = 点击关闭 */}
        <div
          className="absolute inset-0 bg-background/96 backdrop-blur-md"
          onClick={() => setMenuOpen(false)}
        />

        <div className="relative h-full flex flex-col pt-20 pb-8 px-6 overflow-y-auto">
          <p
            className="archive-label text-cinnabar mb-6 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-typewriter)' }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cinnabar" />
            <span>NAVIGATION · 导览</span>
          </p>

          <ul className="list-none space-y-1 mb-8">
            {links.map((link, idx) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex items-baseline justify-between gap-4 py-4 px-3 border-b transition-colors
                      ${active
                        ? `${link.accent ? 'border-cinnabar/60 bg-cinnabar-soft' : 'border-accent/60 bg-accent/[0.06]'}`
                        : 'border-border-subtle hover:border-accent/60 hover:bg-surface-1/60'}`}
                  >
                    <div className="flex items-baseline gap-3 min-w-0">
                      <span
                        className={`text-[10px] tracking-[0.3em] italic shrink-0
                          ${active && link.accent ? 'text-cinnabar' : active ? 'text-accent' : 'text-text-muted'}`}
                        style={enFont}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`font-serif text-xl tracking-[0.15em] truncate
                            ${active
                              ? (link.accent ? 'text-cinnabar' : 'text-accent')
                              : 'text-text-primary group-hover:text-accent'}`}
                        >
                          {link.label}
                        </p>
                        <p
                          className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mt-1"
                          style={enFont}
                        >
                          {link.en}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-base shrink-0 transition-transform duration-300
                        ${active ? 'translate-x-0' : 'group-hover:translate-x-1'}
                        ${link.accent ? 'text-cinnabar' : 'text-accent'}`}
                    >
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/user"
            onClick={() => setMenuOpen(false)}
            className="mt-auto flex items-center justify-center gap-3 py-3 border border-border-hard
                       text-text-secondary hover:border-accent hover:text-accent transition-colors"
          >
            <span className="font-serif text-sm tracking-[0.2em]">个人中心</span>
            <span
              className="text-[9px] tracking-[0.4em] uppercase italic opacity-70"
              style={enFont}
            >
              Profile
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
