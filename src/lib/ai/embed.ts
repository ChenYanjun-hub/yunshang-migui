/**
 * DashScope text-embedding-v3 客户端（OpenAI 兼容模式）
 * 仅在 server 侧使用：API key 来自 DASHSCOPE_API_KEY（未带 NEXT_PUBLIC_ 前缀，天然不会进客户端 bundle）
 * - 1024 维，cosine
 * - 单次最多 25 条文本
 */

const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const MODEL = 'text-embedding-v3';
const BATCH_LIMIT = 10;

type EmbeddingResponse = {
  data: Array<{ embedding: number[]; index: number }>;
  usage?: { total_tokens?: number; prompt_tokens?: number };
  model: string;
};

function getApiKey(): string {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) throw new Error('DASHSCOPE_API_KEY is not set');
  return key;
}

async function callEmbeddings(inputs: string[]): Promise<number[][]> {
  const res = await fetch(`${DASHSCOPE_BASE}/embeddings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      input: inputs,
      encoding_format: 'float',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`dashscope embed failed: ${res.status} ${text}`);
  }

  const json = (await res.json()) as EmbeddingResponse;
  return json.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

/** 单条文本 → 1024 维向量 */
export async function embed(text: string): Promise<number[]> {
  const [vec] = await callEmbeddings([text]);
  return vec;
}

/** 批量文本 → 向量数组（自动按 25 条切分） */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_LIMIT) {
    const batch = texts.slice(i, i + BATCH_LIMIT);
    const vecs = await callEmbeddings(batch);
    out.push(...vecs);
  }
  return out;
}
