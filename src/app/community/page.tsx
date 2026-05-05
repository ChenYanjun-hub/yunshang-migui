'use client';

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const topics = [
  { id: 't1', title: '碧色寨建筑研究', en: 'Bisezhai Architecture', posts: 128, followers: 456 },
  { id: 't2', title: '米轨摄影技巧', en: 'Narrow-Gauge Photography', posts: 89, followers: 234 },
  { id: 't3', title: '滇越铁路历史考证', en: 'Historical Verification', posts: 67, followers: 189 },
];

const discussions = [
  {
    id: 'd1',
    title: '碧色寨车站的法式建筑特点分析',
    author: '历史研究员 · 陈',
    replies: 24,
    views: 1024,
    excerpt: '碧色寨车站融合了法国第三共和时期建筑语汇与本土砖石工艺，其立面节奏与开窗逻辑值得细究…',
    tag: '建筑史',
  },
  {
    id: 'd2',
    title: '人字桥的工程奇迹是如何实现的？',
    author: '工程师 · 李',
    replies: 18,
    views: 856,
    excerpt: '从结构力学角度看，Paul Bodin 的悬臂方案为何在 1907 年的山地条件下成为唯一可行解…',
    tag: '工程',
  },
  {
    id: 'd3',
    title: '寻找消失的站点 — 蒙自段遗址考察',
    author: '探路者 · 周',
    replies: 32,
    views: 1456,
    excerpt: '沿米轨北段徒步三日，在蒙自至草坝之间发现一处疑似废弃水塔基础，请熟悉本地史料的同好辨识…',
    tag: '田野调查',
  },
];

export default function CommunityPage() {
  const [question, setQuestion] = useState('');

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      {/* HEADER */}
      <section className="pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4"
            style={enFont}
          >
            Community · 研学社区
          </p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-[0.05em] text-text-primary mb-6 leading-tight">
            研学社区
          </h1>
          <p
            className="italic text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mb-3"
            style={enFont}
          >
            A reading room for travelers, scholars and curious minds —
            <br className="hidden md:block" />
            ask the AI, join a discussion, design your study route.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            AI 答疑引擎、学术论坛、研学路线定制与视频课程，沿米轨延展每一段思考的距离。
          </p>
        </div>
      </section>

      {/* AI ASSISTANT */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-surface-1 border border-accent/40 p-8 md:p-10 relative">
            <div className="absolute top-0 left-6 right-6 h-[3px] bg-accent/70" />
            <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-start">
              <div className="flex md:flex-col items-center gap-4">
                <div className="w-16 h-16 border border-accent flex items-center justify-center
                                font-serif text-xl tracking-[0.2em] text-accent">
                  AI
                </div>
                <div className="md:text-center">
                  <p
                    className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted"
                    style={enFont}
                  >
                    Beta
                  </p>
                </div>
              </div>

              <div>
                <p
                  className="text-[10px] tracking-[0.4em] uppercase italic text-accent mb-2"
                  style={enFont}
                >
                  Vertical Knowledge Engine
                </p>
                <h2 className="font-serif text-2xl tracking-[0.15em] text-text-primary mb-3">
                  米轨 AI 助手
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  基于滇越铁路垂直语料微调的知识大模型，提供历史 / 建筑 / 工艺的专业对话服务。
                </p>

                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="提问 — 例：人字桥的悬臂结构如何承重？"
                    className="flex-1 px-4 py-3 bg-background border border-border-hard
                               text-foreground placeholder:text-text-muted text-sm
                               focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    className="px-8 py-3 bg-accent text-background text-xs tracking-[0.3em] uppercase
                               hover:bg-transparent hover:text-accent border border-accent
                               transition-colors"
                  >
                    Ask
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {['法式建筑特征', '人字桥结构', '碧色寨现状', '通车年表'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuestion(s)}
                      className="px-3 py-1 text-[11px] border border-border-subtle text-text-muted
                                 hover:border-accent/60 hover:text-text-primary transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOPICS */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic text-accent mb-2"
                style={enFont}
              >
                Trending Topics
              </p>
              <h2 className="font-serif text-2xl tracking-[0.15em] text-text-primary">热门话题</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-subtle border border-border-subtle">
            {topics.map((topic, i) => (
              <div
                key={topic.id}
                className="p-7 bg-surface-1 hover:bg-surface-2/50 transition-colors cursor-pointer group"
              >
                <p
                  className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-3"
                  style={enFont}
                >
                  No.{String(i + 1).padStart(2, '0')} · {topic.en}
                </p>
                <h3 className="font-serif text-lg tracking-[0.1em] text-text-primary mb-4 group-hover:text-accent transition-colors">
                  # {topic.title}
                </h3>
                <div
                  className="flex items-center gap-4 text-[11px] tracking-[0.2em] uppercase italic text-text-muted"
                  style={enFont}
                >
                  <span>{topic.posts} posts</span>
                  <span className="w-px h-3 bg-border-hard" />
                  <span>{topic.followers} followers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCUSSIONS */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic text-accent mb-2"
                style={enFont}
              >
                Recent Discussions
              </p>
              <h2 className="font-serif text-2xl tracking-[0.15em] text-text-primary">最新讨论</h2>
            </div>
            <button
              className="text-xs tracking-[0.3em] uppercase italic text-text-secondary hover:text-accent transition-colors"
              style={enFont}
            >
              发起讨论 →
            </button>
          </div>

          <div className="border-t border-border-subtle">
            {discussions.map((item) => (
              <article
                key={item.id}
                className="border-b border-border-subtle py-7 group cursor-pointer"
              >
                <div className="grid md:grid-cols-[auto_1fr_auto] gap-4 md:gap-8 items-start">
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase italic text-accent px-2 py-1 border border-accent/40 self-start"
                    style={enFont}
                  >
                    {item.tag}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg md:text-xl tracking-[0.08em] text-text-primary mb-2 group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-3">
                      {item.excerpt}
                    </p>
                    <div
                      className="flex items-center gap-3 text-[11px] tracking-[0.2em] italic text-text-muted"
                      style={enFont}
                    >
                      <span>{item.author}</span>
                      <span className="w-px h-3 bg-border-hard" />
                      <span>{item.replies} replies</span>
                      <span className="w-px h-3 bg-border-hard" />
                      <span>{item.views} views</span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted
                               group-hover:text-accent transition-colors hidden md:inline-flex items-center gap-1"
                    style={enFont}
                  >
                    Read
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </span>
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
