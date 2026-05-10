import { Navigation } from '@/components/layout/Navigation';
import AIChatClient from './AIChatClient';
import { RECOMMENDED_QUESTIONS } from '@/lib/ai/system-prompt';

export const metadata = {
  title: '南渡 Nandu · 云南米轨 AI 问答助手 | 云上米轨',
  description: '南渡 —— 基于 DeepSeek V3 + RAG 的滇越铁路垂直领域大模型。一百二十年米轨史，皆可问询，答必有据。',
};

export default function AIPage() {
  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in flex flex-col">
      <Navigation />
      <AIChatClient suggestions={RECOMMENDED_QUESTIONS} />
    </main>
  );
}
