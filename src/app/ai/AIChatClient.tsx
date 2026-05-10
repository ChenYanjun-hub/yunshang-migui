'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

type Props = {
  suggestions: string[];
};

export default function AIChatClient({ suggestions }: Props) {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ai/chat' }),
  });

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const isStreaming = status === 'submitted' || status === 'streaming';
  const empty = messages.length === 0;

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
    sendMessage({ text: trimmed });
    setInput('');
  };

  // 空态：composer 居中 + 推荐问题在下
  if (empty) {
    return (
      <section className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-20">
        <div className="w-full max-w-3xl">
          {/* 品牌头 */}
          <div className="text-center mb-10">
            <p
              className="archive-label text-cinnabar mb-4"
              style={{ fontFamily: 'var(--font-typewriter)' }}
            >
              RECORD · NANDU · 1000mm GAUGE AI
            </p>
            <h1 className="font-serif text-5xl md:text-7xl tracking-[0.08em] text-ink mb-3 leading-none">
              南渡
            </h1>
            <p
              className="italic text-text-secondary text-lg md:text-xl tracking-wide mb-2"
              style={enFont}
            >
              Nandu
            </p>
            <p className="text-sm md:text-base text-text-secondary tracking-wider">
              云南米轨 AI 问答助手
            </p>
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
          <div className="mt-10">
            <p className="archive-label text-center mb-4">SUGGESTED QUERIES · 试试这些</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => submit(q)}
                  className="text-left border border-border-subtle hover:border-cinnabar bg-surface-1/60 hover:bg-cinnabar-soft px-4 py-3 transition-colors group"
                >
                  <span className="font-serif text-[14.5px] leading-relaxed text-text-primary group-hover:text-cinnabar transition-colors">
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
      <div className="flex items-center justify-between px-6 md:px-12 pt-24 pb-3 border-b border-border-subtle bg-surface-2/30">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-cinnabar animate-pulse" />
          <span className="font-serif text-base tracking-[0.2em] text-ink">南渡</span>
          <span className="archive-label" style={enFont}>Nandu · live</span>
        </div>
        <span className="archive-label hidden md:block" style={enFont}>
          DeepSeek · streaming
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-12 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {status === 'submitted' && (
            <div className="flex items-center gap-2 text-text-muted text-sm pl-12">
              <span className="w-1.5 h-1.5 rounded-full bg-cinnabar animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cinnabar animate-bounce [animation-delay:120ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cinnabar animate-bounce [animation-delay:240ms]" />
              <span className="ml-2 italic" style={enFont}>retrieving…</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border-hard bg-surface-2/40 px-6 md:px-12 py-4">
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

function MessageBubble({ message }: { message: ReturnType<typeof useChat>['messages'][number] }) {
  const isUser = message.role === 'user';
  const text = message.parts
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join('');

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] bg-ink text-[#f8f5ee] px-4 py-3 font-serif text-[15px] leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-9 h-9 border border-cinnabar text-cinnabar flex items-center justify-center font-serif text-sm">
        南
      </div>
      <div className="max-w-[88%] font-serif text-[15.5px] leading-[1.85] text-text-primary whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}
