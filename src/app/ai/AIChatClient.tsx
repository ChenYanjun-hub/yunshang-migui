'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import TextType from '@/components/animations/TextType';
import Threads from '@/components/animations/Threads';
import MarkdownAnswer, { type Citation } from './MarkdownAnswer';
import AnswerToolbar from './AnswerToolbar';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const ERA_LABEL: Record<string, string> = {
  construction: '修建期',
  operation: '运营期',
  republic: '民国',
  prc: '建国后',
  heritage: '遗产保护',
};

type Props = {
  suggestions: string[];
  initialQuery?: string;
  from?: string;
};

export default function AIChatClient({ suggestions, initialQuery, from }: Props) {
  // transport 透传 from 给后端：anchor 史料置顶 [1]、system prompt 注入"用户来源"
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/chat',
        body: from ? { from } : undefined,
      }),
    [from],
  );
  const { messages, sendMessage, status, stop, error, regenerate, clearError } = useChat({ transport });

  // 若带了 ?q= 进来则会立刻 auto-submit，避免 textarea 闪现预填文本
  const willAutoSubmit = !!initialQuery?.trim();
  const [input, setInput] = useState(willAutoSubmit ? '' : (initialQuery ?? ''));
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const autoSubmittedRef = useRef(false);
  const isStreaming = status === 'submitted' || status === 'streaming';
  const empty = messages.length === 0;

  // archive Lightbox → /ai?q=... 入口：mount 后自动发送一次（ref 守卫 React strict mode 双跑）
  useEffect(() => {
    if (autoSubmittedRef.current) return;
    const q = initialQuery?.trim();
    if (!q) return;
    autoSubmittedRef.current = true;
    sendMessage({ text: q });
  }, [initialQuery, sendMessage]);

  useEffect(() => {
    if (empty) inputRef.current?.focus();
  }, [empty]);

  useEffect(() => {
    if (!empty) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, status, empty]);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    if (error) clearError();
    sendMessage({ text: trimmed });
    setInput('');
  };

  const handleRetry = () => {
    if (isStreaming) return;
    clearError();
    // 若最后一条是 assistant，regenerate 重生成；若是 user（请求未到达模型就 error），sendMessage 重发
    const last = messages[messages.length - 1];
    if (last?.role === 'user') {
      const text = last.parts
        .map((p) => (p.type === 'text' ? p.text : ''))
        .join('')
        .trim();
      if (text) sendMessage({ text });
    } else {
      regenerate();
    }
  };

  // 空态：composer 居中 + 推荐问题在下
  if (empty) {
    return (
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 md:px-12 pt-24 md:pt-20 pb-12 md:pb-20 overflow-hidden">
        {/* Threads 朱砂丝线背景 —— 像纸上晕开的墨与朱砂 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.55]"
          style={{
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            mixBlendMode: 'multiply',
          }}
        >
          <Threads
            color={[0.545, 0.180, 0.121]}
            amplitude={0.9}
            distance={0.35}
            enableMouseInteraction={false}
          />
        </div>

        <div className="relative z-10 w-full max-w-3xl">
          {/* 品牌头 */}
          <div className="text-center mb-6 md:mb-10">
            <p
              className="archive-label text-cinnabar mb-3 md:mb-4 text-[9.5px] md:text-xs"
              style={{ fontFamily: 'var(--font-typewriter)' }}
            >
              <span className="md:hidden">NANDU · 1000mm GAUGE AI</span>
              <span className="hidden md:inline">RECORD · NANDU · 1000mm GAUGE AI</span>
            </p>
            <h1 className="font-serif text-[3.5rem] md:text-7xl tracking-[0.08em] text-ink mb-2 md:mb-3 leading-none">
              南渡
            </h1>
            <p
              className="italic text-text-secondary text-base md:text-xl tracking-wide mb-3"
              style={enFont}
            >
              Nandu
            </p>
            <TextType
              as="p"
              className="text-[13px] md:text-base text-text-secondary tracking-wider px-2"
              cursorClassName="text-cinnabar"
              text={[
                '欢迎来到南渡',
                'DeepSeek V3 · RAG 检索增强 · 滇越铁路垂直领域大模型',
                '一百二十年米轨史 · 工程档案 · 沿线民俗 皆可问询',
                '答必有据，引必溯源',
              ]}
              typingSpeed={70}
              deletingSpeed={35}
              pauseDuration={2200}
              loop
            />
          </div>

          {/* 主角：大输入框 */}
          <Composer
            inputRef={inputRef}
            input={input}
            setInput={setInput}
            isStreaming={isStreaming}
            onSubmit={() => submit(input)}
            onStop={stop}
            large
          />

          {/* 推荐问题（chip 网格） */}
          <div className="mt-6 md:mt-10">
            <p className="archive-label text-center mb-3 md:mb-4 text-[9.5px] md:text-xs">SUGGESTED QUERIES · 试试这些</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3">
              {suggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => submit(q)}
                  className="text-left border border-border-subtle hover:border-cinnabar bg-surface-1/60 hover:bg-cinnabar-soft px-3.5 md:px-4 py-2.5 md:py-3 transition-colors group"
                >
                  <span className="font-serif text-[13.5px] md:text-[14.5px] leading-relaxed text-text-primary group-hover:text-cinnabar transition-colors">
                    {q}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 有对话：消息流主体 + 底部输入栏
  return (
    <section className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-4 md:px-12 pt-20 md:pt-24 pb-2.5 md:pb-3 border-b border-border-subtle bg-surface-2/30">
        <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
          <span className="w-2 h-2 rounded-full bg-cinnabar animate-pulse shrink-0" />
          <span className="font-serif text-sm md:text-base tracking-[0.15em] md:tracking-[0.2em] text-ink">南渡</span>
          <span className="archive-label truncate" style={enFont}>Nandu · live</span>
        </div>
        <span className="archive-label hidden md:block" style={enFont}>
          DeepSeek · streaming
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 md:px-12 py-5 md:py-8">
        <div className="max-w-3xl mx-auto space-y-5 md:space-y-6">
          {messages.map((m, i) => {
            // 仅最后一条 assistant 消息 + 非流式时允许"重新生成"
            const isLastAssistant =
              m.role === 'assistant' && i === messages.length - 1 && !isStreaming;
            return (
              <MessageBubble
                key={m.id}
                message={m}
                onRegenerate={isLastAssistant ? regenerate : undefined}
              />
            );
          })}

          {status === 'submitted' && (
            <div className="flex items-center gap-2 text-text-muted text-sm pl-12">
              <span className="w-1.5 h-1.5 rounded-full bg-cinnabar animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cinnabar animate-bounce [animation-delay:120ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cinnabar animate-bounce [animation-delay:240ms]" />
              <span className="ml-2 italic" style={enFont}>retrieving…</span>
            </div>
          )}

          {error && (
            <ErrorBanner
              message={error.message}
              onRetry={handleRetry}
              onDismiss={clearError}
            />
          )}
        </div>
      </div>

      <div className="border-t border-border-hard bg-surface-2/40 px-3 md:px-12 py-3 md:py-4">
        <div className="max-w-3xl mx-auto">
          <Composer
            inputRef={inputRef}
            input={input}
            setInput={setInput}
            isStreaming={isStreaming}
            onSubmit={() => submit(input)}
            onStop={stop}
          />
        </div>
      </div>
    </section>
  );
}

function Composer({
  inputRef,
  input,
  setInput,
  isStreaming,
  onSubmit,
  onStop,
  large = false,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  input: string;
  setInput: (v: string) => void;
  isStreaming: boolean;
  onSubmit: () => void;
  onStop: () => void;
  large?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={`relative border bg-surface-1 transition-shadow focus-within:shadow-[0_0_0_3px_var(--cinnabar-soft)] ${
        large
          ? 'border-cinnabar/60 focus-within:border-cinnabar'
          : 'border-border-hard focus-within:border-cinnabar'
      }`}
    >
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={
          large
            ? '问南渡——例如：人字桥的工程难点是什么？'
            : '继续问南渡…'
        }
        rows={large ? 3 : 1}
        className={`w-full resize-none bg-transparent border-0 outline-none text-text-primary placeholder:text-text-muted font-serif leading-relaxed ${
          large ? 'text-[17px] px-5 py-4 pr-28 min-h-[88px]' : 'text-base px-4 py-3 pr-24 max-h-32'
        }`}
      />
      <div className="absolute right-3 bottom-3 flex items-center gap-2">
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="btn-seal text-xs"
            aria-label="停止生成"
          >
            停止
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="btn-seal text-xs"
            aria-label="发送"
          >
            发问
          </button>
        )}
      </div>
    </form>
  );
}

function MessageBubble({
  message,
  onRegenerate,
}: {
  message: ReturnType<typeof useChat>['messages'][number];
  onRegenerate?: () => void;
}) {
  const isUser = message.role === 'user';
  const text = message.parts
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join('');

  // 抽取 data-citations parts（AI SDK v6：自定义 data parts type 形如 `data-<name>`，数据在 `.data` 上）
  const citations: Citation[] = message.parts
    .filter((p): p is { type: 'data-citations'; data: Citation[] } => p.type === 'data-citations')
    .flatMap((p) => p.data);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] bg-ink text-[#f8f5ee] px-4 py-3 font-serif text-[15px] leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }

  // 空答复（刚收到 user 消息、流尚未开始）不渲染工具栏，避免视觉抖动
  const hasContent = text.trim().length > 0;

  return (
    <div className="flex gap-2 md:gap-3">
      <div className="shrink-0 w-8 h-8 md:w-9 md:h-9 border border-cinnabar text-cinnabar flex items-center justify-center font-serif text-xs md:text-sm">
        南
      </div>
      <div className="max-w-[calc(100%-2.5rem)] md:max-w-[88%] flex-1 min-w-0">
        <MarkdownAnswer text={text} citations={citations} />
        {hasContent && (
          <AnswerToolbar text={text} messageId={message.id} onRegenerate={onRegenerate} />
        )}
        {citations.length > 0 && <CitationStrip citations={citations} />}
      </div>
    </div>
  );
}

function CitationStrip({ citations }: { citations: Citation[] }) {
  return (
    <div className="mt-5 pt-4 border-t border-cinnabar/25">
      <p
        className="archive-label text-cinnabar mb-3"
        style={{ fontFamily: 'var(--font-typewriter)' }}
      >
        SOURCES · 引自馆藏 · {citations.length} 条
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2.5">
        {citations.map((c) => (
          <Link
            key={c.archive_id}
            href={`/archive?open=${c.archive_id}`}
            className="group block border border-border-subtle hover:border-cinnabar bg-surface-1/60 hover:bg-cinnabar-soft px-3 md:px-3.5 py-2.5 md:py-3 transition-colors"
          >
            <div className="flex items-baseline gap-2 mb-1.5">
              <span
                className="text-cinnabar text-xs font-bold tracking-wider"
                style={{ fontFamily: 'var(--font-typewriter)' }}
              >
                [{c.n}]
              </span>
              <span className="font-serif text-[14px] text-ink leading-tight group-hover:text-cinnabar transition-colors truncate">
                {c.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-muted tracking-wider mb-1.5" style={enFont}>
              <span>{ERA_LABEL[c.era] ?? c.era}</span>
              {c.year && <span>· {c.year}</span>}
              <span className="ml-auto opacity-60">sim {c.similarity.toFixed(2)}</span>
            </div>
            {c.snippet && (
              <p className="text-[12.5px] text-text-secondary leading-relaxed line-clamp-2">
                {c.snippet}…
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * 错误条 —— 朱砂左边线 + 印章式 ERROR 头 + 重试/关闭
 * 出现于：DeepSeek 调用失败、网络断、stream 中断等 useChat error 状态
 */
function ErrorBanner({
  message,
  onRetry,
  onDismiss,
}: {
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  // 截断过长的 stack/json，保持视觉克制
  const display = message.length > 240 ? message.slice(0, 240) + '…' : message;

  return (
    <div
      role="alert"
      className="flex gap-3 ml-12 border-l-2 border-cinnabar bg-cinnabar-soft px-4 py-3.5 animate-[lightbox-in_240ms_ease-out]"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="archive-label text-cinnabar"
            style={{ fontFamily: 'var(--font-typewriter)' }}
          >
            TRANSMISSION ERROR · 信号中断
          </span>
        </div>
        <p className="text-[13px] text-text-primary font-serif leading-relaxed break-words">
          {display}
        </p>
        <p className="text-[11px] text-text-muted mt-2 italic" style={enFont}>
          The line went silent — try again, or rephrase your question.
        </p>
      </div>
      <div className="shrink-0 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={onRetry}
          className="btn-seal text-[11px] py-1 px-3"
          aria-label="重试"
        >
          重试
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[11px] tracking-wider text-text-muted hover:text-cinnabar transition-colors py-1 px-3 border border-transparent hover:border-cinnabar/30"
          aria-label="关闭错误提示"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
