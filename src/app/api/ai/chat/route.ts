import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { deepseekChat } from '@/lib/ai/deepseek';
import { MIGUI_SYSTEM_PROMPT } from '@/lib/ai/system-prompt';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: deepseekChat,
    system: MIGUI_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
