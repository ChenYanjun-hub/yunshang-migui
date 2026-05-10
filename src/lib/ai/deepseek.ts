import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const apiKey = process.env.DEEPSEEK_API_KEY;

if (!apiKey) {
  throw new Error('DEEPSEEK_API_KEY is not set');
}

export const deepseek = createOpenAICompatible({
  name: 'deepseek',
  apiKey,
  baseURL: 'https://api.deepseek.com/v1',
});

export const deepseekChat = deepseek.chatModel('deepseek-chat');
