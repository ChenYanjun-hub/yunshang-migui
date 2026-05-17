import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from 'ai';
import { deepseekChat } from '@/lib/ai/deepseek';
import { MIGUI_SYSTEM_PROMPT, buildContextBlock } from '@/lib/ai/system-prompt';
import { retrieveArchives, fetchArchiveById, type RetrievedArchive } from '@/lib/ai/retrieve';

export const runtime = 'nodejs';
export const maxDuration = 60;

const ARCHIVE_FROM_RE = /^archive:([0-9a-f-]{36})$/i;

/** 从 UIMessage[] 末尾抽取最近一条用户消息的纯文本，作为检索 query */
function extractLatestUserQuery(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== 'user') continue;
    const text = (m.parts ?? [])
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('\n')
      .trim();
    if (text) return text;
  }
  return '';
}

export async function POST(req: Request) {
  const { messages, from }: { messages: UIMessage[]; from?: string } = await req.json();
  const query = extractLatestUserQuery(messages);
  const anchorId = from?.match(ARCHIVE_FROM_RE)?.[1] ?? null;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // 1. RAG 检索（失败不阻断对话）
      let hits: RetrievedArchive[] = [];
      if (query) {
        try {
          // threshold 0.40：避开"sim 0.30-0.40 的边缘噪声"被注入 system prompt
          // （0.30 太松，脱题 query 也会硬召回 1-2 条不相关史料；0.40 后实测正常 query 仍稳召）
          hits = await retrieveArchives(query, { count: 4, threshold: 0.40 });
        } catch (err) {
          console.error('[chat] RAG retrieve failed:', err);
        }
      }

      // 2. anchor 置顶：用户从史料 Lightbox 进入时，确保该史料一定在 [1]
      if (anchorId) {
        const idx = hits.findIndex((h) => h.archive_id === anchorId);
        if (idx > 0) {
          // 已在结果中但不在首位 → 移到首位
          const [pinned] = hits.splice(idx, 1);
          hits.unshift(pinned);
        } else if (idx === -1) {
          // 不在结果中（语义检索没命中）→ 单独 fetch 一条置顶
          const anchor = await fetchArchiveById(anchorId);
          if (anchor) hits = [anchor, ...hits].slice(0, 4);
        }
      }

      // 3. 先把 citations 写出去，前端可在文本流到达前显示"找到 N 条参考"
      if (hits.length > 0) {
        writer.write({
          type: 'data-citations',
          data: hits.map((h, i) => ({
            n: i + 1,
            archive_id: h.archive_id,
            title: h.title,
            year: h.year,
            era: h.era,
            category: h.category,
            snippet: (h.description ?? '').slice(0, 80),
            similarity: Number(h.similarity.toFixed(3)),
          })),
        });
      }

      // 4. 拼 system prompt：上下文块 + anchor 提示
      const contextBlock = buildContextBlock(hits);
      const anchorHint =
        anchorId && hits[0]?.archive_id === anchorId
          ? `\n\n## 用户来源\n用户从史料《${hits[0].title}》的 Lightbox 进入对话（该史料已置为 [1]）。请优先围绕 [1] 展开解读，再视情况引用其他条目。`
          : '';

      // 5. 流文本生成
      const result = streamText({
        model: deepseekChat,
        system: MIGUI_SYSTEM_PROMPT + contextBlock + anchorHint,
        messages: await convertToModelMessages(messages),
        temperature: 0.6,
      });

      writer.merge(result.toUIMessageStream());
    },
    onError: (err) => {
      console.error('[chat] stream error:', err);
      return err instanceof Error ? err.message : '生成失败';
    },
  });

  return createUIMessageStreamResponse({ stream });
}
