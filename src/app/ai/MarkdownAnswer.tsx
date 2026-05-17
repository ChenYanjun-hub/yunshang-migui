'use client';

import Link from 'next/link';
import { Children, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type Citation = {
  n: number;
  archive_id: string;
  title: string;
  year: number | null;
  era: string;
  category: string;
  snippet: string;
  similarity: number;
};

/**
 * 把模型输出的 `[1]` `[1][3]` 等内联引用号渲染成可点击的朱砂 chip，
 * 同时支持 markdown 的常用结构（粗体、列表、表格、行内代码、链接、引用块）。
 *
 * 流式渲染：每来一个 text-delta 整个 markdown 重新解析；短答案 OK。
 */
export default function MarkdownAnswer({
  text,
  citations,
}: {
  text: string;
  citations: Citation[];
}) {
  const byNum = new Map(citations.map((c) => [c.n, c]));

  const withChips = (children: ReactNode): ReactNode =>
    Children.map(children, (child) => {
      if (typeof child === 'string') return splitChips(child, byNum);
      // react-markdown 偶尔会把 string 包成一个单元素数组；其他情况原样返回
      return child;
    });

  const components: Components = {
    p: ({ children }) => (
      <p className="mb-4 last:mb-0 leading-[1.85]">{withChips(children)}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc marker:text-cinnabar/70 pl-6 mb-4 space-y-1.5">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal marker:text-cinnabar/70 pl-6 mb-4 space-y-1.5">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-[1.8]">{withChips(children)}</li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-ink">{withChips(children)}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-text-secondary">{withChips(children)}</em>
    ),
    h1: ({ children }) => (
      <h2 className="font-serif text-xl tracking-[0.08em] text-ink mt-6 mb-3 first:mt-0">
        {withChips(children)}
      </h2>
    ),
    h2: ({ children }) => (
      <h3 className="font-serif text-lg tracking-[0.06em] text-ink mt-5 mb-2.5 first:mt-0">
        {withChips(children)}
      </h3>
    ),
    h3: ({ children }) => (
      <h4 className="font-serif text-base tracking-[0.04em] text-ink mt-4 mb-2 first:mt-0">
        {withChips(children)}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-cinnabar/50 pl-4 my-4 text-text-secondary italic">
        {children}
      </blockquote>
    ),
    code: ({ children, ...props }) => {
      const inline = !('className' in props);
      if (inline) {
        return (
          <code className="px-1.5 py-0.5 bg-surface-2 border border-border-subtle text-[0.88em] font-mono text-ink">
            {children}
          </code>
        );
      }
      return (
        <code className="block px-4 py-3 bg-surface-2 border border-border-subtle text-[0.88em] font-mono text-ink overflow-x-auto">
          {children}
        </code>
      );
    },
    pre: ({ children }) => <pre className="my-4">{children}</pre>,
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cinnabar underline underline-offset-2 decoration-cinnabar/40 hover:decoration-cinnabar transition-colors"
      >
        {withChips(children)}
      </a>
    ),
    hr: () => <hr className="my-6 border-border-subtle" />,
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="text-left font-serif tracking-wider border-b border-border-hard px-3 py-2 text-ink">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-border-subtle px-3 py-2 align-top">
        {withChips(children)}
      </td>
    ),
  };

  return (
    <div className="font-serif text-[15.5px] text-text-primary">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

/** 把含 `[n]` 的字符串切成「文本片段 + CitationChip」混合节点 */
function splitChips(s: string, byNum: Map<number, Citation>): ReactNode {
  const re = /\[(\d+)\]/g;
  const parts: ReactNode[] = [];
  let lastIdx = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > lastIdx) parts.push(s.slice(lastIdx, m.index));
    const n = Number(m[1]);
    const c = byNum.get(n);
    if (c) {
      parts.push(<CitationChip key={`c${key++}`} n={n} archiveId={c.archive_id} title={c.title} />);
    } else {
      // 模型 hallucinate 了不存在的编号 —— 弱化显示，保留原文证据
      parts.push(
        <span key={`x${key++}`} className="text-text-muted text-[0.78em] align-super">
          [{n}]
        </span>,
      );
    }
    lastIdx = m.index + m[0].length;
  }
  if (parts.length === 0) return s;
  if (lastIdx < s.length) parts.push(s.slice(lastIdx));
  return parts;
}

function CitationChip({ n, archiveId, title }: { n: number; archiveId: string; title: string }) {
  return (
    <Link
      href={`/archive?open=${archiveId}`}
      title={`引自馆藏《${title}》`}
      className="inline-flex items-center justify-center align-baseline mx-[1px] px-1.5 min-w-[1.4em] text-[0.72em] font-bold leading-none py-[2px] text-cinnabar bg-cinnabar/[0.07] hover:bg-cinnabar hover:text-[#f8f5ee] border border-cinnabar/40 hover:border-cinnabar transition-colors no-underline"
      style={{ fontFamily: 'var(--font-typewriter)' }}
    >
      {n}
    </Link>
  );
}

