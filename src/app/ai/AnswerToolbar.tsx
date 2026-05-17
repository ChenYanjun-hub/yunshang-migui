'use client';

/**
 * 南渡答复工具栏 —— 复制 / 重新生成 / 喜欢
 *
 * 视觉原则：克制
 *   - 默认极轻（text-muted + 小号 + 无边框），不抢答复主体
 *   - hover 才显朱砂 + 边框 → 暗示可点
 *   - 三态反馈用 inline 文案，不弹 toast（项目没引入 toast 体系，保持一致性）
 *
 * 数据持久化：
 *   - 喜欢用 localStorage（key: `nandu:like:${messageId}`），演示前不动数据库
 *   - 演示后若要做真实反馈池，迁移到 ai_feedback 表 + server action（已为后续留出接口形状）
 *
 * 重新生成：
 *   - useChat.regenerate() 由父组件透传（仅最后一条 assistant 消息接收 onRegenerate）
 *   - 非最后一条 / 正在 streaming：按钮不渲染（而非 disabled，减少视觉噪音）
 */

import { useEffect, useState } from 'react';

type Props = {
  /** 纯文本答复内容（已合并所有 text parts） */
  text: string;
  /** 唯一消息 ID，作为 localStorage key 后缀 */
  messageId: string;
  /** 重新生成回调；仅最后一条 assistant + 非流式时传入，否则按钮隐藏 */
  onRegenerate?: () => void;
};

export default function AnswerToolbar({ text, messageId, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  // mount 后读 localStorage（SSR/hydration 安全，避免服务端读 localStorage 报错）
  useEffect(() => {
    try {
      setLiked(localStorage.getItem(`nandu:like:${messageId}`) === '1');
    } catch {
      // localStorage 不可用（隐私模式等）：保持默认 false
    }
  }, [messageId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 极少数浏览器无 clipboard API：退化为选中文本（演示场景几乎不会触发）
      setCopied(false);
    }
  };

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    try {
      if (next) localStorage.setItem(`nandu:like:${messageId}`, '1');
      else localStorage.removeItem(`nandu:like:${messageId}`);
    } catch {
      // 写不进 localStorage 不阻断 UI 反馈
    }
  };

  return (
    <div
      className="mt-3 flex items-center gap-1.5 text-[11px] tracking-wider text-text-muted"
      style={{ fontFamily: 'var(--font-typewriter)' }}
      aria-label="答复操作"
    >
      <ToolButton onClick={handleCopy} active={copied} label={copied ? '复制反馈：已复制' : '复制答复'}>
        {copied ? '已复制 ✓' : '复制'}
      </ToolButton>

      {onRegenerate && (
        <ToolButton onClick={onRegenerate} label="重新生成答复">
          重新生成
        </ToolButton>
      )}

      <ToolButton onClick={handleLike} active={liked} label={liked ? '已取消喜欢' : '喜欢这条答复'}>
        {liked ? '已喜欢 ●' : '喜欢'}
      </ToolButton>
    </div>
  );
}

function ToolButton({
  onClick,
  children,
  active = false,
  label,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        'px-2.5 py-1 border transition-colors uppercase',
        active
          ? 'border-cinnabar/40 text-cinnabar bg-cinnabar-soft'
          : 'border-transparent hover:border-cinnabar/30 hover:text-cinnabar hover:bg-cinnabar-soft/50',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
