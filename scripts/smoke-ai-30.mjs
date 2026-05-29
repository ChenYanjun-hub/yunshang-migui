/* 南渡 AI · 30 题 smoke test
 * 域内 20 题 + 越界 10 题，跑完输出 JSON + Markdown 报告
 * 用法：node scripts/smoke-ai-30.mjs > /tmp/smoke-result.json
 */

const ENDPOINT = process.env.AI_ENDPOINT || 'http://localhost:3000/api/ai/chat';

const DOMAIN_QUESTIONS = [
  '滇越铁路是哪一年建成通车的？',
  '米轨的"米"指的是什么？',
  '人字桥的工程难点是什么？',
  '滇越铁路全长多少公里？起点和终点分别是哪里？',
  '法国人主导滇越铁路修建的原因是什么？',
  '滇越铁路在修建过程中有多少工人因伤病死亡？',
  '谁是滇越铁路的总工程师？',
  '碧色寨车站有什么特别之处？',
  '抗战时期滇越铁路扮演了什么角色？',
  '滇越铁路有哪些代表性的桥梁工程？',
  '滇越铁路对昆明的现代化进程有什么影响？',
  '米轨与标准轨距相比有什么优劣？',
  '滇越铁路现在还在运营吗？',
  '滇越铁路沿线有哪些少数民族聚居区？',
  '河口站作为终点站有什么历史地位？',
  '介绍一下宜良车站。',
  '滇越铁路的运营公司是哪家？股权结构是怎样的？',
  '滇越铁路有哪些被列入文物保护的站点？',
  '滇越铁路修建期间发生过哪些重大事故？',
  '滇越铁路对越南北部经济有什么影响？',
];

const OUT_OF_SCOPE_QUESTIONS = [
  '今天昆明天气怎么样？',
  '帮我推荐一只今天能买的股票。',
  '巴黎奥运会开幕式怎么样？',
  '用 Python 写一个快速排序。',
  '周杰伦最新专辑叫什么？',
  '介绍一下青藏铁路的历史。',
  '我应该和我女朋友分手吗？',
  '怎么治感冒？',
  '美元兑人民币现在多少？',
  '解释一下相对论。',
];

async function ask(question) {
  const start = Date.now();
  let firstByteMs = null;
  let text = '';
  let citations = [];

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            id: crypto.randomUUID(),
            role: 'user',
            parts: [{ type: 'text', text: question }],
          },
        ],
      }),
    });

    if (!res.ok) {
      return { error: `HTTP ${res.status}`, text, citations, firstByteMs, totalMs: Date.now() - start };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (firstByteMs == null) firstByteMs = Date.now() - start;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === 'text-delta' && typeof ev.delta === 'string') text += ev.delta;
          else if (ev.type === 'data-citations' && Array.isArray(ev.data)) citations = ev.data;
        } catch {
          /* incomplete chunk – skip */
        }
      }
    }
  } catch (err) {
    return { error: err.message, text, citations, firstByteMs, totalMs: Date.now() - start };
  }

  return { text, citations, firstByteMs, totalMs: Date.now() - start };
}

async function runBatch(label, questions) {
  const out = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    process.stderr.write(`[${label} ${i + 1}/${questions.length}] ${q.slice(0, 30)}...`);
    const r = await ask(q);
    out.push({ n: i + 1, q, ...r });
    process.stderr.write(
      `  ✓ ${(r.text || r.error || '').slice(0, 40)}... ` +
        `[cites=${r.citations.length}, ${r.totalMs}ms]\n`,
    );
  }
  return out;
}

const startAll = Date.now();
process.stderr.write('=== Domain (20) ===\n');
const domain = await runBatch('D', DOMAIN_QUESTIONS);
process.stderr.write('\n=== Out-of-Scope (10) ===\n');
const oos = await runBatch('O', OUT_OF_SCOPE_QUESTIONS);
process.stderr.write(`\n=== TOTAL: ${((Date.now() - startAll) / 1000).toFixed(1)}s ===\n`);

console.log(JSON.stringify({ domain, outOfScope: oos, totalMs: Date.now() - startAll }, null, 2));
