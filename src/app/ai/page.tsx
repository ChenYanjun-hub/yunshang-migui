import { Navigation } from '@/components/layout/Navigation';
import AIChatClient from './AIChatClient';
import { RECOMMENDED_QUESTIONS } from '@/lib/ai/system-prompt';

export const metadata = {
  title: '南渡 Nandu · 云南米轨 AI 问答助手 | 云上米轨',
  description: '南渡 —— 云南米轨垂直领域 AI 文化向导，懂滇越铁路、人字桥、碧色寨、抗战通道。',
};

export default function AIPage() {
  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in flex flex-col">
      <Navigation />
      <AIChatClient suggestions={RECOMMENDED_QUESTIONS} />
    </main>
  );
}
