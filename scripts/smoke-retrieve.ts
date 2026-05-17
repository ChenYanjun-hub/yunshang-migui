/**
 * 检索质量烟雾测试
 * 用法：npm run smoke:retrieve
 */
import { retrieveArchives } from '../src/lib/ai/retrieve';

const QUERIES = [
  '人字桥是谁设计的？',                  // 命中实体 + 设计者
  '碧色寨车站什么时候建的？',            // 命中地点 + 时间
  '抗战期间滇越铁路发生了什么？',         // 抽象语义
  '法国工程师在云南的工作',              // 跨条目语义
  '米轨轨距',                          // 极短关键词
];

(async () => {
  for (const q of QUERIES) {
    console.log('\n========================================');
    console.log('Q:', q);
    console.log('========================================');
    const t0 = Date.now();
    const results = await retrieveArchives(q, { count: 4, threshold: 0.15 });
    const ms = Date.now() - t0;
    if (results.length === 0) {
      console.log(`  (no hit, ${ms}ms)`);
      continue;
    }
    results.forEach((r, i) => {
      console.log(
        `  [${i + 1}] sim=${r.similarity.toFixed(3)}  ${r.title}` +
          (r.year ? ` (${r.year})` : '') +
          `\n      ${(r.description ?? '').slice(0, 70)}…`,
      );
    });
    console.log(`  (${results.length} hits, ${ms}ms)`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
