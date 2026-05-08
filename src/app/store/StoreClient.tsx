'use client';

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export type StoreProduct = {
  id: string;
  name: string;
  price: number;
  category: string | null;
  cover_url: string | null;
  description: string | null;
};

const tabs: { key: string; label: string; en: string }[] = [
  { key: 'all', label: '全部', en: 'All' },
  { key: 'physical', label: '实体文创', en: 'Physical' },
  { key: 'digital', label: '数字藏品', en: 'Digital' },
  { key: 'experience', label: '研学体验', en: 'Experience' },
];

export default function StoreClient({ products }: { products: StoreProduct[] }) {
  const [tab, setTab] = useState<string>('all');
  const list = tab === 'all'
    ? products
    : products.filter((p) => (p.category ?? '').toLowerCase() === tab);

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4" style={enFont}>
            Store · 文创商城
          </p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-[0.05em] text-text-primary mb-6 leading-tight">
            文创商城
          </h1>
          <p className="italic text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mb-3" style={enFont}>
            Objects, editions and journeys —<br className="hidden md:block" /> bringing the railway home, in print and pixel.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            米轨主题文创、数字藏品与研学体验。
          </p>
        </div>
      </section>

      <section className="border-y border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-5 py-2 text-xs tracking-[0.25em] border transition-all duration-200 ${
                  tab === t.key
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-border-hard text-text-secondary hover:border-accent/60 hover:text-text-primary'
                }`}
              >
                <span className="block">{t.label}</span>
                <span className="block text-[9px] tracking-[0.4em] italic mt-0.5 opacity-60" style={enFont}>
                  {t.en}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          {list.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-[11px] tracking-[0.4em] uppercase italic text-text-muted mb-3" style={enFont}>
                No items
              </p>
              <p className="font-serif text-xl text-text-secondary">
                {products.length === 0 ? '商城暂无在架商品' : '该分类暂无商品'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              {list.map((product) => {
                const cover = product.cover_url ?? `https://picsum.photos/seed/${product.id}/600/600?grayscale`;
                return (
                  <article key={product.id} className="group cursor-pointer">
                    <div className="aspect-square bg-surface-1 border border-border-subtle relative overflow-hidden group-hover:border-accent/50 transition-all duration-500 group-hover:shadow-[0_18px_36px_-20px_rgba(168,136,74,0.35)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        style={{ filter: 'sepia(0.10) contrast(0.98)' }}
                      />
                      {product.category && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-background/85 border border-border-subtle">
                          <span className="text-[9px] tracking-[0.3em] uppercase italic text-text-secondary" style={enFont}>
                            {product.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="font-serif text-sm md:text-base tracking-[0.05em] text-text-primary mb-2 group-hover:text-accent transition-colors leading-tight">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-text-secondary line-clamp-2 mb-2">{product.description}</p>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-lg text-accent">¥{Number(product.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="py-10 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-sm tracking-[0.2em] text-text-primary">云上米轨</span>
            <span className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted" style={enFont}>
              Yunshang Migui
            </span>
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>
            © 2026 · Dianyue Railway Digital Heritage Platform
          </p>
        </div>
      </footer>
    </main>
  );
}
