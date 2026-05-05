'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const links = [
  { href: '/archive', label: '史料藏馆', en: 'Archive' },
  { href: '/cloud-tour', label: '云游导览', en: 'Cloud Tour' },
  { href: '/exhibition', label: '光影展览', en: 'Exhibition' },
  { href: '/community', label: '研学社区', en: 'Community' },
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
                className={`relative group inline-flex flex-col items-center transition-colors duration-300
                  ${active ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <span className="text-sm tracking-[0.2em]">{link.label}</span>
                <span
                  className="text-[9px] tracking-[0.4em] uppercase italic mt-0.5 opacity-60"
                  style={enFont}
                >
                  {link.en}
                </span>
                <span
                  className={`absolute -bottom-1.5 left-0 right-0 mx-auto h-px bg-accent transition-all duration-300
                    ${active ? 'w-full' : 'w-0 group-hover:w-full'}`}
                />
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
