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

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500
        ${scrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border-subtle'
          : 'bg-gradient-to-b from-background/85 to-transparent border-b border-transparent'}
        px-6 py-4 md:px-12 md:py-5 flex justify-between items-center`}
    >
      <Link href="/home" className="flex items-baseline gap-3 group">
        <span className="font-serif text-xl md:text-2xl tracking-[0.2em] text-text-primary group-hover:text-accent transition-colors">
          云上米轨
        </span>
        <span
          className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted hidden sm:block"
          style={enFont}
        >
          Yunshang Migui
        </span>
      </Link>

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

      <Link
        href="/user"
        className="ml-4 md:ml-0 w-10 h-10 border border-border-hard hover:border-accent hover:text-accent
                   text-text-secondary flex items-center justify-center font-serif text-sm tracking-wider
                   transition-colors"
        aria-label="个人中心"
      >
        旅
      </Link>
    </nav>
  );
}
