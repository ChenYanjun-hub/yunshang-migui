'use client';

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

type ProductType = 'physical' | 'digital' | 'experience';

const products: {
  id: string;
  name: string;
  en: string;
  price: number;
  originalPrice?: number;
  type: ProductType;
  seed: string;
}[] = [
  { id: 'p1', name: '碧色寨记忆 · 明信片套装', en: 'Bisezhai Postcards', price: 39, originalPrice: 49, type: 'physical', seed: 'store-1' },
  { id: 'p2', name: '米轨数字藏品 #001', en: 'Migui Digital Edition', price: 99, type: 'digital', seed: 'store-2' },
  { id: 'p3', name: '滇越铁路主题 T 恤', en: 'Dianyue Tee', price: 128, type: 'physical', seed: 'store-3' },
  { id: 'p4', name: '碧色寨研学一日游', en: 'One-Day Field Tour', price: 299, type: 'experience', seed: 'store-4' },
  { id: 'p5', name: '米轨主题手账本', en: 'Migui Notebook', price: 68, originalPrice: 88, type: 'physical', seed: 'store-5' },
  { id: 'p6', name: '人字桥结构模型', en: 'Cantilever Bridge Model', price: 188, type: 'physical', seed: 'store-6' },
  { id: 'p7', name: '复古铁路票根藏品', en: 'Vintage Ticket Reprint', price: 49, type: 'physical', seed: 'store-7' },
  { id: 'p8', name: '滇越铁路纪录片下载', en: 'Documentary Download', price: 36, type: 'digital', seed: 'store-8' },
];

const tabs: { key: 'all' | ProductType; label: string; en: string }[] = [
  { key: 'all', label: '全部', en: 'All' },
  { key: 'physical', label: '实体文创', en: 'Physical' },
  { key: 'digital', label: '数字藏品', en: 'Digital' },
  { key: 'experience', label: '研学体验', en: 'Experience' },
];

const typeBadge: Record<ProductType, string> = {
  physical: 'Physical',
  digital: 'Digital',
  experience: 'Experience',
};

export default function StorePage() {
  const [tab, setTab] = useState<'all' | ProductType>('all');
  const list = tab === 'all' ? products : products.filter((p) => p.type === tab);

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4"
            style={enFont}
          >
            Store · 文创商城
          </p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-[0.05em] text-text-primary mb-6 leading-tight">
            文创商城
          </h1>
          <p
            className="italic text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mb-3"
            style={enFont}
          >
            Objects, editions and journeys —<br className="hidden md:block" /> bringing the railway home, in print and pixel.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            米轨主题文创、数字藏品与研学体验，支持线上购买与沿线打卡点自提。
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
                className={`px-5 py-2 text-xs tracking-[0.25em] border transition-all duration-200
                  ${
                    tab === t.key
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-border-hard text-text-secondary hover:border-accent/60 hover:text-text-primary'
                  }`}
              >
                <span className="block">{t.label}</span>
                <span
                  className="block text-[9px] tracking-[0.4em] italic mt-0.5 opacity-60"
                  style={enFont}
                >
                  {t.en}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {list.map((product) => (
              <article key={product.id} className="group cursor-pointer">
                <div className="aspect-square bg-surface-1 border border-border-subtle relative overflow-hidden
                                group-hover:border-accent/50 transition-all duration-500
                                group-hover:shadow-[0_18px_36px_-20px_rgba(168,136,74,0.35)]">
                  <img
                    src={`https://picsum.photos/seed/${product.seed}/600/600?grayscale`}
                    alt={product.name}
                    width={600}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    style={{ filter: 'sepia(0.18) contrast(0.96)' }}
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-background/85 border border-border-subtle">
                    <span
                      className="text-[9px] tracking-[0.3em] uppercase italic text-text-secondary"
                      style={enFont}
                    >
                      {typeBadge[product.type]}
                    </span>
                  </div>
                  {product.originalPrice && (
                    <span
                      className="absolute top-3 right-3 px-2 py-1 text-[9px] tracking-[0.3em] uppercase italic
                                 bg-accent text-background"
                      style={enFont}
                    >
                      Sale
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <p
                    className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted mb-1"
                    style={enFont}
                  >
                    {product.en}
                  </p>
                  <h3 className="font-serif text-sm md:text-base tracking-[0.05em] text-text-primary mb-2 group-hover:text-accent transition-colors leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-lg text-accent">¥{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-[11px] text-text-muted line-through italic" style={enFont}>
                        ¥{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-sm tracking-[0.2em] text-text-primary">云上米轨</span>
            <span
              className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted"
              style={enFont}
            >
              Yunshang Migui
            </span>
          </div>
          <p
            className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted"
            style={enFont}
          >
            © 2026 · Dianyue Railway Digital Heritage Platform
          </p>
        </div>
      </footer>
    </main>
  );
}
