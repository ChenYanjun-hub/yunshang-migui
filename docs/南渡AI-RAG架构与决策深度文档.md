# 南渡 AI · RAG 架构与决策深度文档

> 面向 AIPM 学习者的深度教学材料  ·  写于 2026-05-16
>
> 本文档不是 README，不是接口文档，是一份"为什么这么做"的思考路径记录。读完之后，你应该能：
>
> - 给非技术同事讲清楚 RAG 是怎么工作的
> - 看到一个 RAG 项目时，能识别每个设计决策的得失
> - 自己启动一个新的 RAG 项目时，知道每一步该问什么问题
> - 能跟工程师就具体技术细节平等对话

---

## 阅读说明

| 章节 | 难度 | 读完时间 | 学到什么 |
|---|---|---|---|
| 第 1 部分 · 基础概念 | ★ | 30 min | RAG 是什么、为什么、怎么工作 |
| 第 2 部分 · 系统架构 | ★★ | 25 min | 南渡 AI 的全貌 + 数据流 |
| 第 3 部分 · 关键决策 | ★★★ | 60 min | 12 个技术选型的"为什么" |
| 第 4 部分 · 评测方法学 | ★★★ | 30 min | 怎么知道 RAG 做得好不好 |
| 第 5 部分 · 运维操作 | ★★ | 15 min | 上线后怎么跑 |
| 第 6 部分 · AIPM 反思 | ★★★ | 30 min | 10 条踩过的坑 + 沟通技巧 |
| 第 7 部分 · 改进路线 | ★★ | 15 min | 下一步往哪走 |
| 附录 · 学习资源 + 作业 | — | — | 你自己动手 |

**建议读法**：第一遍扫读全文找感觉；第二遍逐节深读，对照源码看；第三遍合上文档，自己复述一遍。

---

# 第 1 部分 · 基础概念

## 1.1 什么是 RAG？为什么不直接用 LLM？

**RAG = Retrieval-Augmented Generation**，检索增强生成。

直接用 LLM 回答专业问题（"碧色寨车站什么时候建的？"）会有 3 个问题：

1. **知识截止日期**：DeepSeek / GPT-4 的训练数据停在某个时间点之前，新信息不知道
2. **知识广度 ≠ 深度**：通用 LLM 知道滇越铁路的大概，但具体到"五家寨大桥的钢拱跨度是 67.15 米"这种细节，要么答错要么编造（**幻觉**）
3. **知识不可追溯**：用户问"这个数据从哪来？"——LLM 说不清，不可追溯

**RAG 的核心思路**：

> 把项目自己的资料（档案、文档、知识库）变成一个"可以按语义查找的库"，每次用户提问时：
> 1. 先去库里找出最相关的几条资料
> 2. 把这几条资料拼到 prompt 里给 LLM
> 3. 让 LLM 基于这些资料回答（并标注来源）

这样：
- 知识是你自己的（可控、可追溯）
- LLM 只负责"读懂资料 + 组织语言"
- 答错的概率大幅降低，因为 LLM 看到了真正的资料

**南渡 AI 的实例**：

用户问："人字桥是谁设计的？"

- 没有 RAG：LLM 凭训练数据回答，可能正确也可能编造一个不存在的工程师名字
- 有 RAG：先从档案库找出"人字桥"相关的 3-4 条史料 → 把这些史料给 LLM → LLM 基于史料说"人字桥由保罗·波丁设计 [1]"，并附档案出处

## 1.2 RAG vs Fine-tuning vs Plain Prompt

这是 AIPM 必须能回答的问题：**项目要做 AI 问答，到底该选哪种方案？**

| 方案 | 怎么做 | 优点 | 缺点 | 何时选 |
|---|---|---|---|---|
| **Plain Prompt** | 写好 system prompt，用户提问，LLM 直接答 | 0 工程量、即开即用 | 知识来自模型训练，不可控、易幻觉、无法溯源 | 通用对话、不需要专业准确性 |
| **RAG** | 自己的资料 → 向量库 → 检索 → 拼 prompt → LLM 答 | 知识可控、可追溯、便宜、新增资料无需重训 | 需要建向量库、检索质量依赖切块/嵌入 | **专业领域问答 / 知识库 / 内部文档**——南渡 AI 是典型场景 |
| **Fine-tuning** | 用自己的数据微调模型权重 | 模型"内化"了你的知识，回答风格也定制 | 训练成本高、新增知识要重训、不可追溯、易过拟合 | 风格定制（让模型学某种文风）/ 任务定制（特定 NLP 任务）|
| **混合**（RAG + Fine-tune）| 先 fine-tune 学风格，再 RAG 提供事实 | 风格 + 知识双重控制 | 工程复杂度最高 | 大型成熟产品（如客服 bot 第二阶段） |

**南渡 AI 选 RAG 的 4 个理由**：
1. **专业知识**——滇越铁路是窄领域，通用 LLM 训练数据中占比极小
2. **可追溯性**——博物馆级的项目，"史料从哪来"是核心要求（CitationStrip 直接呈现）
3. **新增成本**——admin 上传一条新档案，跑一遍 embed 就生效，不需要重训
4. **预算**——RAG 没有训练成本，只有 embedding 成本（一次性 + 增量）+ LLM 推理成本（按 token 计费）

## 1.3 向量嵌入（Embedding）原理

要做"按语义搜索"，必须先把文本变成"机器能比较相似度"的形式。

**朴素方案**：关键词匹配（Elasticsearch / 传统搜索）。问题：用户问"火车站建造时间"，匹配不到"碧色寨于 1909 年通车"——同义不同词。

**向量方案**：把每段文本编码成一个高维数字向量（南渡 AI 用的是 1024 维浮点数组）。语义相近的文本，向量在空间中也相近。

**直觉理解**：
- 把每段文本想象成一个"主题坐标"。比如 1024 维空间里：
  - "人字桥的工程奇迹" → 坐标 (0.1, 0.8, -0.3, ..., 0.5)
  - "五家寨大桥的钢拱设计" → 坐标 (0.2, 0.7, -0.2, ..., 0.6) ← 跟上面很近
  - "云南菜过桥米线" → 坐标 (-0.5, -0.1, 0.9, ..., 0.0) ← 跟上面很远
- 计算两个向量的"距离"（cosine 相似度），就知道语义近不近

**embedding 模型怎么训练出来**：
- 用海量文本对（比如"问题 + 答案"），训练一个神经网络
- 训练目标：让相似的文本对的向量距离近，不相似的远
- 训练完只保留"文本 → 向量"的映射函数

**南渡 AI 的实现**：[src/lib/ai/embed.ts](../src/lib/ai/embed.ts)

```ts
// 调阿里云 DashScope 的 text-embedding-v3 API
// 输入：一段中文文本
// 输出：1024 个 float 组成的数组
const vec = await embed("人字桥是谁设计的？");
// vec.length === 1024
// vec[0] ≈ 0.0234, vec[1] ≈ -0.0891, ...
```

## 1.4 向量相似度检索原理

有了向量，怎么"检索"？

**朴素方案 · 暴力比较**：
1. 把用户 query embed 成向量
2. 跟库里**每一条** archive 的向量算 cosine 相似度
3. 排序，取 topK

复杂度 O(N * D)，N 是库大小，D 是向量维度。N=1000 还能凑合，N=100 万就慢到不可接受。

**工业方案 · 近似最近邻索引（ANN）**：
- HNSW（Hierarchical Navigable Small World）：用图结构跳着搜，把 O(N) 降到 O(log N)
- IVF（Inverted File）：先聚类再在簇里搜
- 二者各有取舍（详见 §3.5）

**Cosine 相似度公式**：
```
cosine(A, B) = (A · B) / (|A| * |B|)
```
- 取值范围 [-1, 1]
- 1 = 完全相同，0 = 无关，-1 = 完全相反
- 实际场景中文本向量基本不会出现负值，所以你看到的范围一般是 [0, 1]

**南渡 AI 的设定**：
- 高于 0.40 = 有意义的相关
- 0.30-0.40 = 边缘噪声（5/13 实验后定的边界）
- 低于 0.30 = 几乎无关

## 1.5 一张图看懂 RAG

```
┌─────────────────────────────────────────────────────────────────┐
│                      离线阶段（数据准备）                        │
│                                                                  │
│   ┌──────────┐   ┌────────┐   ┌──────────────┐                 │
│   │ archives │ → │ embed  │ → │ archives_    │                 │
│   │（DB 表）  │   │（1024D）│   │ embeddings  │                 │
│   └──────────┘   └────────┘   │（pgvector）   │                 │
│                                └──────────────┘                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      在线阶段（用户问答）                        │
│                                                                  │
│   用户输入                                                       │
│      │                                                           │
│      ▼                                                           │
│   ┌──────────────┐                                              │
│   │ Next.js API  │ /api/ai/chat                                 │
│   │ (route.ts)   │                                              │
│   └──────┬───────┘                                              │
│          │                                                       │
│          ├──▶ ❶ embed(query) → 1024D 向量                      │
│          │                                                       │
│          ├──▶ ❷ match_archives RPC → 取 topK + threshold        │
│          │       命中的 archive ID + 相似度                      │
│          │                                                       │
│          ├──▶ ❸ 写出 'data-citations'（前端先看到来源卡）       │
│          │                                                       │
│          ├──▶ ❹ buildContextBlock(hits) 拼到 system prompt      │
│          │                                                       │
│          └──▶ ❺ streamText(LLM) 流式生成 → 前端打字机效果       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# 第 2 部分 · 南渡 AI 的整体架构

## 2.1 系统全景

南渡 AI 是云上米轨平台的一个子模块，结构如下：

```
┌──────────────────────────────────────────────────────┐
│  浏览器 · /ai 页面                                    │
│  ─ AIChatClient.tsx (useChat hook + ErrorBanner +    │
│    CitationStrip + ReactMarkdown)                    │
└──────────────────────┬───────────────────────────────┘
                       │ POST /api/ai/chat (SSE 流)
                       ▼
┌──────────────────────────────────────────────────────┐
│  Vercel Function · /api/ai/chat/route.ts             │
│  ─ runtime: 'nodejs', maxDuration: 60                │
│  ─ extractLatestUserQuery → query                    │
│  ─ retrieveArchives(query) → hits                    │
│  ─ anchor 置顶（可选）                                │
│  ─ writer.write({type:'data-citations', ...})        │
│  ─ streamText(deepseek + system + context)           │
└────────┬──────────────────────────────────────┬──────┘
         │                                       │
         ▼                                       ▼
┌────────────────────────┐         ┌────────────────────────┐
│  DashScope             │         │  DeepSeek              │
│  text-embedding-v3     │         │  deepseek-chat         │
│  1024D, OpenAI 兼容    │         │  OpenAI 兼容           │
└────────────┬───────────┘         └────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│  Supabase Postgres + pgvector                        │
│  ─ archives 表（status='published' 才会被检索）       │
│  ─ archives_embeddings 表（vector(1024) + HNSW）      │
│  ─ match_archives() 函数（RPC 调用入口）              │
└──────────────────────────────────────────────────────┘
```

## 2.2 一次完整对话的数据流

以"碧色寨车站什么时候建的？"为例，逐步追踪：

### Step 1 · 浏览器侧（AIChatClient.tsx）
- 用户在输入框打字 → 提交
- `useChat` hook 把 messages 数组（含历史对话）POST 到 `/api/ai/chat`
- payload 形如：
  ```json
  {
    "messages": [
      { "role": "user", "parts": [{ "type": "text", "text": "碧色寨车站什么时候建的？" }] }
    ],
    "from": "archive:9d3f-..."  // 可选，如果用户从某档案 Lightbox 进入对话
  }
  ```

### Step 2 · 服务端入口（route.ts:32-36）
- 从最末一条 user message 抽出文本作为 query
- 检查 `from` 字段是否带 anchor archive ID

### Step 3 · RAG 检索（route.ts:39-49 → retrieve.ts）
- 调 `embed("碧色寨车站什么时候建的？")` → 1024 维向量
- 调 Supabase RPC `match_archives(query_embedding, threshold=0.40, count=4)`
- pgvector 用 HNSW 索引在 archives_embeddings 表里找最相似的 4 条
- 返回结果（举例）：
  ```
  [
    { archive_id: 'a1', title: '碧色寨车站建筑述略', similarity: 0.871, ... },
    { archive_id: 'a2', title: '滇越铁路通车纪事',   similarity: 0.732, ... },
    { archive_id: 'a3', title: '蒙自法商海关年报',   similarity: 0.612, ... },
    { archive_id: 'a4', title: '云南近代铁路工程史', similarity: 0.547, ... },
  ]
  ```

### Step 4 · Anchor 置顶（route.ts:52-63）
- 如果用户从某档案 Lightbox 进入对话（`from=archive:xxx`），确保该档案在 `[1]` 位置
- 三种情况处理：
  - 已在结果首位 → 不动
  - 在结果中但非首位 → 移到首位
  - 不在结果中（语义未命中）→ 单独 fetch 后置顶
- **PM 价值**：用户看着某张老照片想问问题，AI 必须围绕这张照片回答，不能跑题

### Step 5 · 先发 Citations（route.ts:66-80）
- 用 `writer.write({ type: 'data-citations', data: [...] })` 立即把 citations 推给前端
- **关键设计**：前端在 LLM 文本流到达**之前**就能渲染"找到 4 条参考"的卡片。让用户感知系统在干活，缓解等待焦虑

### Step 6 · 拼 system prompt（route.ts:82-87 → system-prompt.ts:47-59）
- `buildContextBlock(hits)` 把命中的史料拼成 markdown 文本
- 加上 `MIGUI_SYSTEM_PROMPT`（角色 + 规则 + RAG 引用规则共 5 条）
- 如果有 anchor，再附一段"用户从《xxx》Lightbox 进入对话"的提示

最终 system prompt 形如：
```
你是"南渡"，云上米轨平台的 AI 文化向导……

## 身份 / 知识范围 / 回答风格 / 边界 / RAG 引用规则
（详见 system-prompt.ts）

## 参考史料（馆藏档案，引用请用 [n]）

[1] 《碧色寨车站建筑述略》（1909年）
碧色寨车站位于云南蒙自，建于 1909 年，由法国铁路公司主持建造……
来源：云南省档案馆
作者：李某某

[2] 《滇越铁路通车纪事》（1910年）
……
```

### Step 7 · LLM 流式生成（route.ts:90-97）
- `streamText` 调 DeepSeek，model='deepseek-chat'，temperature=0.6
- 返回 SSE 流，每个 chunk 是 LLM 的下一个 token
- `writer.merge(result.toUIMessageStream())` 把 LLM 流合并到外层 stream

### Step 8 · 浏览器渲染
- 前端 `useChat` 接收 SSE 流
- 文本部分实时打字机式渲染（ReactMarkdown）
- 引用编号 `[1]` `[2]` 是 markdown 文本里的占位
- CitationStrip 组件读取 `data-citations` chunk，渲染来源卡片
- 如果 stream 中途出 error chunk → ErrorBanner 触发（5/13 实现）

## 2.3 文件清单与职责

| 文件 | 行数 | 职责 |
|---|---|---|
| `src/app/api/ai/chat/route.ts` | 106 | API 入口，编排 retrieve + anchor + LLM + citations |
| `src/lib/ai/retrieve.ts` | 92 | RAG 检索：query → embed → match_archives RPC |
| `src/lib/ai/embed.ts` | 64 | DashScope 嵌入 API 客户端，单条 + 批量两接口 |
| `src/lib/ai/archive-embed.ts` | 100 | 单条 archive 的 embed + upsert helper（admin 写入时调） |
| `src/lib/ai/system-prompt.ts` | 59 | system prompt + buildContextBlock + 推荐问题列表 |
| `src/lib/ai/deepseek.ts` | 15 | DeepSeek 模型工厂（@ai-sdk/openai-compatible） |
| `src/app/ai/AIChatClient.tsx` | ~430 | 前端聊天 UI（useChat、CitationStrip、ErrorBanner） |
| `scripts/embed-archives.ts` | 106 | 批量嵌入脚本，幂等 + 增量 |
| `scripts/smoke-retrieve.ts` | 39 | 烟雾测试，验证检索质量 |
| `supabase/migrations/001_archives_embeddings.sql` | 80 | 表 + HNSW 索引 + match_archives 函数 + RLS |

---

# 第 3 部分 · 关键设计决策深度剖析

这是 AIPM 学习重点。每一节都按"决策 + 理由 + 替代方案对比 + 何时反向"展开。

## 3.1 嵌入模型 · 为什么选 DashScope text-embedding-v3

**决策**：用阿里云 DashScope 的 `text-embedding-v3`，1024 维。

**理由**：

| 候选 | 维度 | 中文质量 | 价格（每百万 token） | 部署延迟 | 中国可访问性 |
|---|---|---|---|---|---|
| **DashScope text-embedding-v3** ✅ | 1024 | **优** | 约 ¥0.0007/千 token | 国内 < 100ms | 原生支持 |
| OpenAI text-embedding-3-small | 1536 | 良 | $0.02/M | 跨境延迟 200-500ms | 需要代理 |
| OpenAI text-embedding-3-large | 3072 | 优 | $0.13/M | 跨境 | 需要代理 |
| BGE-M3（开源 / 自部署） | 1024 | 优 | 0（自己付服务器钱）| 视部署 | 无障碍 |
| Cohere embed-multilingual-v3 | 1024 | 良 | $0.10/M | 跨境 | 受限 |

**南渡 AI 选 DashScope 的 4 个考虑**：

1. **中文领域优势**：`text-embedding-v3` 在中文语料上训练比例高，对古文 / 半文言（"东方小巴黎"、"百年米轨"）的语义理解优于 OpenAI
2. **价格碾压**：跑完整个项目的 embed 不到 1 元
3. **网络稳定**：中国境内调用，无需代理
4. **跟项目可能用的其他阿里服务（OSS、PolarDB-PG）一致**：未来真要换数据库，DashScope 留在阿里生态，链路最优

**何时反向**：
- 如果项目走多语言（要支持英文 / 越南语 / 法语用户提问）→ 切 OpenAI 或 BGE-M3
- 如果项目要自部署、不能调外部 API → 切 BGE-M3 / Sentence-Transformers
- 如果对维度有特殊要求（比如已存量是 1536 维）→ 切 OpenAI

**关键代码**：[src/lib/ai/embed.ts:8-10](../src/lib/ai/embed.ts#L8)

```ts
const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const MODEL = 'text-embedding-v3';
const BATCH_LIMIT = 10;  // DashScope 单次最多 10 条
```

注意 `compatible-mode/v1` —— DashScope 支持 OpenAI 兼容模式，可以用 OpenAI SDK 直接打。**这是阿里云的好心**——降低了用户切换成本。

## 3.2 向量数据库 · 为什么选 pgvector 而不是 Pinecone / Weaviate

**决策**：用 Supabase Postgres + pgvector 扩展，不用专用向量数据库。

**对比**：

| 候选 | 性质 | 优点 | 缺点 | 适合场景 |
|---|---|---|---|---|
| **pgvector**（Postgres 扩展） ✅ | SQL 库的扩展 | **跟主表 join 方便**、运维统一、成本 0、社区大 | 单表 1 亿向量后性能下降 | < 100w 向量、跟业务数据强关联 |
| Pinecone | 专用 SaaS | 极致性能、自动扩缩容 | 贵（最低 $70/月）、跟主库分离要 join 自己写 | > 1000w 向量、专精向量检索 |
| Weaviate | 自部署 + 云 | 功能丰富（混合检索、模块化）| 运维负担、学习曲线 | 中型项目要混合检索 |
| Qdrant | 自部署 + 云 | Rust 写的，快 | 功能不如 Weaviate 全 | 性能优先 |
| Milvus / Zilliz | 自部署 + 云 | 国内有商用支持 | 资源吃得多 | 大型企业级 |

**南渡 AI 选 pgvector 的 5 个理由**：

1. **数据规模小**：100 条档案级别，pgvector 性能完全够用
2. **跟主表强关联**：每次检索都要拿 archive 的 title/description/source 等字段渲染 CitationStrip。pgvector 直接 `JOIN archives` 一条 SQL 搞定；Pinecone 要再回主库查
3. **运维统一**：本来就用 Supabase Postgres，加 `create extension vector` 就完事，不增加新组件
4. **成本 0**：Supabase 免费档够，Pinecone 起步价 $70/月
5. **可移植性最好**：未来换平台（PolarDB-PG / Neon / 自托管 PG），所有逻辑零改动

**何时反向**：
- 数据规模到 100 万 - 1000 万级别 → 考虑 Qdrant
- 1000 万以上 → 考虑 Pinecone / Milvus
- 需要稀疏向量（BM25 + dense 混合）→ Weaviate / Qdrant

**关键代码**：[supabase/migrations/001_archives_embeddings.sql](../supabase/migrations/001_archives_embeddings.sql)

```sql
create extension if not exists vector;

create table public.archives_embeddings (
  archive_id      uuid primary key references public.archives(id) on delete cascade,
  embedding       vector(1024) not null,
  chunk_text      text         not null,
  ...
);

create index archives_embeddings_hnsw_cosine
  on public.archives_embeddings
  using hnsw (embedding vector_cosine_ops);
```

**注意 `references public.archives(id) on delete cascade`** —— 这是 pgvector 的杀手锏。删除一条 archive，对应的 embedding 自动删除，无需在应用层同步。Pinecone 做不到这种数据库级一致性。

## 3.3 切块策略 · 为什么整条 archive 作 1 chunk

**决策**：每条 archive（标题 + 时期 + 类型 + 描述 + 来源 + 作者）拼成一段文本，整体 embed 成一个向量。**不做段落级 / 句子级切分**。

**朴素直觉**：长文档要切成小段（chunk），每段单独 embed，检索时返回最相关的段而不是整篇。这是大多数 RAG 教程教的做法。

**南渡 AI 偏离教科书的理由**：

1. **每条 archive 描述本来就短** —— 100-500 字，不需要再切
2. **archive 的语义是"整体性"的** —— 标题 / 时期 / 描述合在一起才是一条"史料档案"。切碎了就丢失了"这是 1909 年的法国老照片"这种结构信息
3. **检索目标是"找档案"而不是"找段落"** —— 用户问题对应的是某条史料整体，CitationStrip 卡片也是按 archive 渲染的，切碎后反而难拼回去
4. **chunk_text 同时承担了"给 LLM 看的上下文"** —— 把档案完整给 LLM，模型能看到 source / author 元数据，引用质量更高

**buildArchiveChunkText 的拼装顺序**（[archive-embed.ts:41-51](../src/lib/ai/archive-embed.ts#L41)）：

```ts
function buildArchiveChunkText(a) {
  const lines = [a.title];                    // 1. 标题（最强信号）
  lines.push(`时期：${ERA_LABEL[a.era]}`);    // 2. 时期标签（中文化）
  lines.push(`类型：${CATEGORY_LABEL[a.category]}`);  // 3. 类型
  if (a.description) lines.push(a.description);  // 4. 描述主体
  if (a.source) lines.push(`来源：${a.source}`);
  if (a.author) lines.push(`作者：${a.author}`);
  return lines.join('\n');
}
```

**关键细节**：把 era 和 category 从英文枚举值（`construction`/`heritage`）翻译成中文（`修建期`/`遗产保护期`）再 embed。**不翻译会怎样**？模型对 `construction` 这种英文枚举的语义理解远不如"修建期 (1903-1910)"清晰，检索时遇到"建造时期"这种中文 query 时召回率会下降。

**何时反向**：
- 单文档很长（PDF 论文、口述史长文）→ 必须切分，每 200-500 字一个 chunk，带 100 字 overlap
- 文档有强结构（章/节/段）→ 按结构切分而不是固定字数
- 检索目标是"找答案中的某句"而不是"找整篇文档"→ 必须切到句子级

## 3.4 相似度度量 · 为什么 cosine

**决策**：用 cosine similarity（余弦相似度）。

**三种常见度量**：

| 度量 | 公式 | 范围 | 物理意义 |
|---|---|---|---|
| **Cosine** ✅ | A·B / (|A|·|B|) | [-1, 1] | 两向量夹角，**只看方向不看长度** |
| Dot Product | A·B | (-∞, +∞) | 夹角 + 长度共同影响 |
| L2 (欧氏距离) | |A-B| | [0, +∞) | 空间直线距离 |

**为什么 cosine**：

文本 embedding 的"长度"通常没有明确语义（一段长文跟一段短文 embed 出来的向量长度不同，但语义可能完全一样）。Cosine 只看方向 → 长短不影响相似度判断 → 更适合文本场景。

**Dot product** 在某些模型（如 OpenAI）是被推荐的，因为它们的 embedding 已经做了 L2 归一化（长度都是 1），此时 dot 等价于 cosine 但计算更快。但 DashScope 没明确说做了归一化，用 cosine 最稳。

**L2** 适合"空间近邻"语义（图像、声纹），文本场景不推荐。

**关键代码**：[001_archives_embeddings.sql:30-32](../supabase/migrations/001_archives_embeddings.sql)

```sql
create index archives_embeddings_hnsw_cosine
  on public.archives_embeddings
  using hnsw (embedding vector_cosine_ops);  -- 选择 cosine 操作符族
```

```sql
-- match_archives 函数里
1 - (e.embedding <=> query_embedding) as similarity
```

`<=>` 是 pgvector 的 cosine **distance** 操作符（取值 [0, 2]），用 `1 -` 转成 cosine **similarity**（[0, 1]）。

## 3.5 索引算法 · HNSW vs IVFFlat

**决策**：用 HNSW（Hierarchical Navigable Small World）。

**对比**：

| 索引 | 原理 | 构建速度 | 查询速度 | 内存占用 | 适合 |
|---|---|---|---|---|---|
| **HNSW** ✅ | 多层图结构，跳着搜 | 慢 | **极快** O(log N) | 较大 | 读多写少、追求查询性能 |
| IVFFlat | 先聚类，查询时只搜最近的几个簇 | 快 | 快但不如 HNSW | 较小 | 写多读少、内存有限 |
| Flat（暴力） | 不建索引，逐条比较 | 0 | O(N)，慢 | 最小 | 数据少（< 1000 条） |

**为什么 HNSW**：
- 南渡 AI 是"读多写少"——用户每天可能问几百次，admin 一周加几条档案
- 数据规模上 1000 条都困难，HNSW 内存占用不是问题
- 查询性能高 = 用户体验好

**何时反向**：
- 数据写入非常频繁（每秒新增几百向量）→ IVFFlat
- 数据量极小（< 500 条）→ Flat 反而最快（不用走索引开销）

## 3.6 检索阈值 · 0.40 的得来

这是 5/13 日志记录过的真实调参故事，AIPM 必读。

### 故事原貌

**初始默认**：`threshold = 0.30`

**问题暴露**：5/12 测试时发现，用脱题 query "如何用 Rust 写一个 TCP 服务器？" 提问，会硬召回 1 条 sim 0.342 的史料（人字桥工程图纸）。**模型靠 system prompt 第 4 条规则扛住了**（"若所有史料语义都偏离用户问题，必须先说馆藏档案暂无相关条目"），但前端 CitationStrip 仍然渲染了那条无关史料 → **用户看到"找到 1 条参考资料"，点进去发现是工程图纸 → 误以为系统在乱给资料**。

### 实验

5/13 实验 5 条正常 query + 1 条脱题 query，对照 0.30 vs 0.40 两档：

| 测试 | 旧 (0.30) | 新 (0.40) |
|---|---|---|
| 5 条正常 query smoke | 全召（最低 sim 0.519）| 全召（最低 sim 0.519）|
| 脱题 Rust 题 | sim 0.342 噪声硬召 1 条 | **0 hits** ✅ |
| 抗战 query top1 | 0.771 | 0.771 |

**结论**：阈值上提到 0.40 没有伤及任何正常 query 的召回，且彻底杜绝了脱题噪声。

### AIPM 学习点

1. **阈值不是拍脑袋**——必须用实际 query 跑实验，否则永远在猜
2. **正常 query + 脱题 query 都要测**——只测正常的会让你"以为"系统好，但其实噪声率很高
3. **观察 sim 分数的"间隙"**——正常 query 最低 0.519，噪声最高 0.342，中间有 0.18 的间隙 → 0.40 是天然的分界
4. **改阈值要同步改注释**：[retrieve.ts:25-27](../src/lib/ai/retrieve.ts#L25)

```ts
/** cosine 相似度阈值，默认 0.40（实测 0.30 会让脱题 query 硬召回噪声） */
threshold?: number;
```

5. **smoke-retrieve.ts 的 threshold 是 0.15 用于诊断**——故意用最松阈值看"召回的尾巴"是否合理，**不要跟 production 阈值搅在一起**

```ts
// scripts/smoke-retrieve.ts:21
const results = await retrieveArchives(q, { count: 4, threshold: 0.15 });
```

## 3.7 TopK 选择 · 为什么 6 → 4

**默认是 6**（[retrieve.ts:23](../src/lib/ai/retrieve.ts#L23)），实际 chat route 调时传 `count: 4`（[route.ts:45](../src/app/api/ai/chat/route.ts#L45)）。

**为什么 4 比 6 好**：

| TopK | 优点 | 缺点 |
|---|---|---|
| 2 | 上下文最简，token 省 | 容易漏 |
| 4 ✅ | 覆盖足够，token 控制好 | —— |
| 6-8 | 召回最全 | system prompt 长，DeepSeek 容易"挑近的不挑准的"，且 token 成本 1.5-2 倍 |
| 10+ | —— | 注意力稀释，模型容易跑偏 |

**LLM 注意力的"中部凹陷"现象**（lost in the middle）：
- 论文 https://arxiv.org/abs/2307.03172 证明：当 prompt 上下文很长时，LLM 对**开头和末尾**的内容关注度高，**中段**会被忽略
- topK 越大，中间档史料被忽略的概率越高
- topK=4 让所有命中都落在 LLM 的"高注意力区"

**4 的得来**：演示场景下，4 条史料足够给一个详细回答。如果你的项目是百科全书式的，可能要 8。

## 3.8 LLM 选择 · 为什么 DeepSeek

**决策**：DeepSeek `deepseek-chat`（[deepseek.ts:15](../src/lib/ai/deepseek.ts#L15)）。

**对比**：

| LLM | 中文 | 价格 | 速度 | 上下文 | 国内可访问 |
|---|---|---|---|---|---|
| **DeepSeek-Chat** ✅ | 优 | **¥0.001/千 in, ¥0.002/千 out**（极便宜）| 中 | 64K | 原生 |
| GPT-4o | 优 | $5/$15 per M token | 快 | 128K | 需代理 |
| GPT-4o-mini | 良 | $0.15/$0.60 per M | 极快 | 128K | 需代理 |
| Claude 3.5 Sonnet | 优 | $3/$15 per M | 中 | 200K | 需代理 |
| 通义千问 qwen-max | 优 | ¥0.04/¥0.12 per K | 中 | 32K | 原生 |
| 文心一言 4.0 | 良 | 类似 qwen | 中 | 8K | 原生 |
| 智谱 GLM-4 | 优 | ¥0.05/¥0.05 per K | 快 | 128K | 原生 |

**DeepSeek 选型的 4 个理由**：

1. **中文质量与 GPT-4 对齐**——DeepSeek-V2 在中文 benchmark 上接近 GPT-4o
2. **价格比 GPT-4o 便宜约 30 倍**——演示规模成本可忽略
3. **国内访问稳定**——不用代理
4. **OpenAI 兼容 API**——`@ai-sdk/openai-compatible` 包直接接，不需要写自定义 client

**何时反向**：
- 复杂推理 / 多步任务 → Claude 3.5 / GPT-4o（DeepSeek 在 chain-of-thought 任务上略弱）
- 需要超长上下文（> 100K）→ Claude 3.5（200K）/ GPT-4o
- 需要图像输入 → GPT-4o / Claude（DeepSeek-Chat 不支持图像）

## 3.9 System Prompt 设计 · 5 条规则的来历

[system-prompt.ts:1-32](../src/lib/ai/system-prompt.ts#L1) 的 5 条 RAG 规则是项目最关键的"AI 行为契约"。逐条拆解：

### 规则 1 · 引用编号格式

> 优先基于这些史料作答，每次引用对应史料处用 [1] [2] 这样的编号紧跟该句末（紧贴句号前或前一个汉字后），不要在编号两侧加空格

**为什么写得这么细**：模型默认会写 "...修建于 1909 年。 [1]" 或 "...修建于 1909 年 [1] 。"——前者多余空格，后者句号位置不对。前端的 CitationStrip 用正则匹配 `[1]` 来高亮交互，**位置错了交互就坏**。

**AIPM 教训**：prompt 不能只说"加引用"，要把**渲染契约**写清楚。模型很聪明但很"懒"，不写明白就会用最省事的方式输出。

### 规则 2 · 多条引用的连写格式

> 同一句话引用多条史料用 [1][3] 这种连写格式

**为什么**：避免 "[1] [3]" 中间有空格被前端正则吃掉。

### 规则 3 · 史料覆盖不全的兜底

> 史料覆盖不全的部分可用通识补充，但要明确说"史料未直接记载，据通识……"

**为什么**：用户问题可能跨越多个史料覆盖外的领域。如果模型完全沉默会显得无能；如果模型不加区分地用通识又会让用户分不清"哪些是档案、哪些是模型自己说的"。这条规则**强制划清边界**——提供通识时要标注。

### 规则 4 · 空块兜底（最重要的一条）

> 若"参考史料"块为空 或 所有史料语义都偏离用户问题，必须先说"馆藏档案暂无相关条目"，再用通识简短作答；不要硬把无关史料拉来凑数

**为什么这条最关键**：
- 阈值过滤后可能 0 命中，模型如果不知道这种情况会编造
- 阈值刚过线（如 sim 0.42）的命中可能跟问题不太相关，模型如果硬拉来凑会输出"用户问 A，但根据 [1]（实际跟 A 无关的史料）……"——这是最坏的体验

**5/13 的故事就是这条规则在起作用**——脱题 Rust 题虽然召回了 1 条噪声，但模型按规则 4 说"馆藏档案暂无相关条目"，避免了灾难。

### 规则 5 · 不附"参考资料列表"

> 不要在答案末尾附"参考资料列表"——前端会自动渲染溯源卡片，重复了反而冗余

**为什么**：模型默认会模仿学术论文格式在末尾列参考。但前端的 CitationStrip 已经把每条史料渲染成可点击卡片，模型再列一遍是冗余。

### AIPM 模板：写 RAG system prompt 的 6 个固定块

```
1. 角色身份（你是谁）
2. 知识范围（你专精什么、不专精什么）
3. 回答风格（语言 / 段落 / 格式偏好）
4. 边界（什么不该答、怎么礼貌引回）
5. RAG 引用规则（如何标注来源）
6. 兜底规则（史料为空 / 偏离时怎么办）
```

南渡 AI 的 prompt 完全按这 6 块写。建议你以后做 RAG 项目时直接套用。

## 3.10 Citations 流式优先

**关键决策**：先发 citations chunk，再开始流文本。

```ts
// route.ts:66-80
if (hits.length > 0) {
  writer.write({
    type: 'data-citations',
    data: hits.map(...),
  });
}

// 然后才是
const result = streamText({...});
writer.merge(result.toUIMessageStream());
```

**为什么这顺序很关键**：
- LLM 第一个 token 出来需要 500ms - 2s
- citations 数据是同步可得的（已经查好了）
- 把 citations 提前发 → 前端可以在 0ms 时就显示"找到 4 条参考资料"卡片
- 用户感知"系统在干活"——**等待焦虑 -50%**

**这是个 PM 视角的微优化**——技术上 1 行代码（先 write 后 merge），但用户感知差异巨大。**这种"花 5 分钟工程换 50% 体验"的优化是 AIPM 应该专门寻找的**。

## 3.11 Anchor 置顶机制

[route.ts:51-63](../src/app/api/ai/chat/route.ts#L51) 实现了 anchor 置顶。

**场景**：用户在 `/archive` 页面看到一张老照片，点击 "问南渡" 按钮，跳转到 `/ai?from=archive:abc123`。此时 AI 必须围绕这张照片回答，不能跑题。

**实现**：
1. URL 带 `from=archive:xxx` → route 解析出 anchor ID
2. RAG 检索后，检查命中结果里有没有这个 anchor
3. 三种情况：
   - **已在首位**：不动
   - **在结果中但非首位**：移到首位
   - **完全没命中**（用户问的问题跟这张照片语义不一致）：用 `fetchArchiveById` 单独取出来强制置顶
4. 在 system prompt 末尾加一段"用户从《xxx》Lightbox 进入，请优先围绕 [1] 展开"

**AIPM 学习点**：**RAG 不只是"语义检索"——业务场景往往有"用户当前焦点"这种强信号需要强制注入**。永远要问："用户在哪个上下文里提的这个问题？"

## 3.12 错误处理 · ErrorBanner + 智能重试

[AIChatClient.tsx:78-90](../src/app/ai/AIChatClient.tsx#L78) 的 handleRetry 智能分支：

```ts
function handleRetry() {
  clearError();
  // 若最后一条是 assistant，regenerate 重生成
  // 若最后一条是 user（请求未到达模型就 error），sendMessage 重发
  const last = messages[messages.length - 1];
  if (last.role === 'user') {
    sendMessage({...});
  } else {
    regenerate();
  }
}
```

**为什么需要分支**：useChat 的 `regenerate()` 默认重生成最后一条 assistant message。但如果错误发生在**user 消息发出后、assistant 流开始前**（比如网络断了），messages 末尾就是 user message，此时 regenerate 行为不可靠 —— 必须用 sendMessage 重发。

**AIPM 教训**：错误状态有多种，不能用统一的"重试"逻辑。要先想清楚错误发生在哪一阶段，再设计对应的恢复路径。

---

# 第 4 部分 · 数据评测方法学（PM 学习重点）

## 4.1 烟雾测试 · smoke-retrieve.ts

[scripts/smoke-retrieve.ts](../scripts/smoke-retrieve.ts) 是项目唯一的"自动化检索质量测试"。

**它做什么**：
- 准备 5 条精心选择的代表性 query
- 对每条 query 跑 retrieveArchives（threshold 用诊断级 0.15）
- 打印每条命中的 sim 分数 + 标题 + 描述前 70 字 + 总耗时

**为什么 query 是这 5 条**（不是随便编的）：

```ts
const QUERIES = [
  '人字桥是谁设计的？',          // 命中实体 + 设计者
  '碧色寨车站什么时候建的？',    // 命中地点 + 时间
  '抗战期间滇越铁路发生了什么？', // 抽象语义
  '法国工程师在云南的工作',      // 跨条目语义
  '米轨轨距',                  // 极短关键词
];
```

每条 query 测试不同的检索能力维度：
1. **实体 + 关系**（"人字桥 + 设计者"）——能否同时召回这两个语义点
2. **实体 + 时间**——能否处理时间维度
3. **抽象语义**（"抗战期间发生了什么"——没有具体实体）——能否处理虚指
4. **跨条目语义**——能否把多条相关史料都召回
5. **极短关键词**（仅 4 个字）——能否处理短文本（embedding 对短文本天然弱）

**AIPM 学习点**：**好的测试集是"覆盖不同语义类型的最小代表性集合"**，不是越多越好。5 条 query 跑得快（< 5s），失败了能快速定位问题模式。

## 4.2 阈值调优实录

§3.6 已经讲过 0.30 → 0.40 的故事。这里把调优**方法论**单独提炼：

### 阈值调优 4 步法

1. **设置上下两个候选阈值**（如 0.30 vs 0.40）
2. **准备两类 query**：
   - 正常 query（应该有命中）
   - 脱题 query（应该 0 命中，比如本项目里的 "Rust TCP 服务器"）
3. **对照实验**：两阈值下分别跑两类 query，记录命中数和 sim 分布
4. **看"间隙"**：如果正常 query 的最低 sim 跟脱题 query 的最高 sim 之间有明显间隙（如 0.519 vs 0.342），就在间隙里取一个分界值

### 阈值调优常见错误

❌ **只看正常 query**——会让你觉得阈值随便选都行（因为正常 query 一般 sim > 0.5）
❌ **看绝对数字而不看分布**——0.40 在你这是好阈值，在别的项目可能完全不对
❌ **频繁微调**——每次改 0.01 没意义，要么不改，要么大跳一档（0.30 → 0.40）
❌ **忘了同步默认值**——retrieve.ts 默认值跟 chat route 实际传值要一致，不一致会让人迷惑

## 4.3 评测维度

完整评测一个 RAG 系统应该看这 6 个维度：

| 维度 | 怎么测 | 南渡 AI 当前怎么做 |
|---|---|---|
| **召回率（Recall）** | 标注一批 query 的"真值答案"，看检索是否命中 | 烟雾测试 5 条 query 主观评估 |
| **准确率（Precision）** | 看命中的内容里有多少是真相关的 | 主观评估 |
| **噪声率** | 脱题 query 被错误召回的比例 | §3.6 实验 |
| **生成质量** | LLM 答案是否准确、是否有幻觉 | 人工 review |
| **延迟** | 端到端响应时间 | smoke-retrieve 打印总 ms |
| **成本** | 每次 query 消耗的 token + 钱 | 未跟踪 |

**南渡 AI 的评测有缺口**——下一节展开。

## 4.4 我们没做的（和为什么）

### 没做：formal eval set（正式评测集）

**典型做法**：人工标注 50-200 条 query + 对应的"正确答案 archive ID"。每次改阈值/换模型都跑一遍，看准确率/召回率/F1 变化。

**南渡为什么不做**：
1. 项目是演示规模，没有那么多 query 来源
2. 标注 50 条 query 至少要 4-6 小时人工
3. ROI 不够：演示前手动测几个关键 query 已经覆盖大部分场景

**何时该做**：上线后用户量起来，开始有真实 query log → 从 log 里采样建 eval set → 持续监控

### 没做：RAGAS 等自动化评测

**RAGAS** 是评估 RAG 系统的标准开源框架，能自动算 faithfulness（忠实度）/ answer relevance / context precision / context recall 等指标。

**为什么不做**：
- 需要 LLM as judge（用 GPT-4 给答案打分）→ 多一份成本
- 需要 eval set（同上）
- 演示阶段意义不大

**何时该做**：进入"持续优化"阶段，需要回归测试防止改动引入退化

### 没做：A/B 测试

**为什么不做**：单一用户 / 演示场景，没有 A/B 测试的统计基础

### 没做：用户反馈收集

5/13 日志里有计划：assistant message bubble 加"喜欢-不喜欢"按钮 → 收集用户反馈。**这是上线后必须做的**，因为：
- 自动化评测看的是预设指标，**用户感知**才是真理
- 反馈数据可以反过来用作 fine-tune 或 reranker 训练数据

## 4.5 PM 视角 · "够好就行"的边界

**核心原则**：评测投入要跟产品阶段匹配。

| 阶段 | 评测投入 | 重点 |
|---|---|---|
| **原型 / 演示** | 5-10 条手工 query 烟雾测试 | "能跑起来 + 看着对" |
| **小流量上线** | 用户反馈按钮 + log 监控 | "实际用着不崩" |
| **规模化** | eval set + 自动化指标 | "改动不退化" |
| **优化** | A/B 测试 + RAGAS | "新方案是否真的更好" |

南渡现在在第 1 阶段，方法论用第 1 阶段的就够。**过度评测是新手 PM 最常见的浪费**。

---

# 第 5 部分 · 操作与运维

## 5.1 批量嵌入流程

**场景**：第一次部署 / 数据迁移 / 嵌入模型升级时，要把所有 archive 重新 embed。

**命令**：
```bash
npm run embed:archives           # 增量（只 embed 新或更新的）
npm run embed:archives -- --all  # 全量
```

**逻辑**（[scripts/embed-archives.ts](../scripts/embed-archives.ts)）：
1. 查 archives 表所有 status='published' 的行
2. 查 archives_embeddings 表已有的 (archive_id, updated_at)
3. 对每条 archive：
   - 不在 embeddings 表里 → embed
   - 在但 archive.updated_at > embedding.updated_at → 重 embed
   - 否则跳过
4. 批量调 DashScope（每批最多 10 条），拿向量
5. 分批 upsert 到 embeddings 表（每批 50 条）

**为什么这么设计**：
- **增量过滤**省钱（不重复 embed 没变的内容）
- **批量调 API** 减少网络往返开销
- **upsert** 保证幂等（任何时候重跑都安全）

## 5.2 admin 写入时的同步重嵌

**问题**：admin 在 `/admin/archives` 改了一条 archive 的描述，向量库怎么自动更新？

**实现**（[src/app/admin/archives/actions.ts:12-21](../src/app/admin/archives/actions.ts#L12)）：

```ts
async function syncEmbedding(archiveId: string) {
  try {
    const r = await embedAndUpsertArchive(archiveId);
    if (r.skipped) {
      console.warn(`[admin] embed skipped for ${archiveId}: ${r.skipped}`);
    }
  } catch (err) {
    console.error(`[admin] embed failed for ${archiveId}:`, err);
    // 注意：不抛出！失败不阻断 admin 主流程
  }
}
```

每次 createArchive / updateArchive / setArchiveStatus 后调用 syncEmbedding。

**为什么 try-catch 吞错**（[archive-embed.ts](../src/lib/ai/archive-embed.ts)）：
- DashScope API 偶尔 429 / 网络抖动
- 如果失败抛错 → admin 表单提交失败 → 用户体验崩
- 失败时只打 log，留给 `npm run embed:archives` 增量任务后续兜底
- **失败的代价**：那条 archive 在向量库里短暂落后于主表（最多到下次跑 embed 脚本）—— 可接受

**AIPM 学习点**：**关键路径与非关键路径分离**。admin 写入是关键路径（不能失败），embed 同步是非关键路径（可延迟）。混在一个事务里会拖累用户体验。

## 5.3 失败容错策略

| 失败点 | 当前处理 |
|---|---|
| RAG 检索失败（DashScope 挂了） | route.ts 吞错 → 当成 0 命中走 LLM 通识回答 |
| LLM 流失败 | onError 把错误转 string → 前端 ErrorBanner 触发 |
| admin 写入后 embed 失败 | 吞错打 log → 等 npm run embed:archives 兜底 |
| 用户提空消息 | API 返回 error chunk → ErrorBanner |
| 用户带坏 role | API 返回 error chunk → ErrorBanner |

**核心思想**：每一层都要回答"我失败了，下游怎么活下去"。

## 5.4 成本估算

南渡 AI 演示规模的成本拍脑袋：

| 项目 | 用量 | 成本 |
|---|---|---|
| DashScope embed（首次全量 100 条 archive） | ~50K tokens | < ¥0.05 |
| DashScope embed（每条 user query） | ~50 tokens × 1000 query/天 | ~¥0.04/天 |
| DeepSeek（每次对话约 2K 输入 + 500 输出） | × 1000 query/天 | ~¥1.5/天 |
| Supabase 数据库 | 免费档 | ¥0 |
| Vercel 函数 | 免费档 | ¥0 |

**演示期总成本**：< ¥10/月（基本免费）

**上线后规模化估算**：1 万 query/天 → 约 ¥15/天 → ¥450/月。这个量级大头是 DeepSeek 推理成本。

**AIPM 经验**：RAG 系统主要成本在 LLM 推理（不是 embed、不是 DB）。控成本的关键是：
1. 把 system prompt 写紧（每个 token 都付钱）
2. topK 不要贪多（topK 翻倍 ≈ 成本翻倍）
3. 多轮对话裁剪（不要把完整历史每次都发）—— 5/13 列入 backlog

---

# 第 6 部分 · AIPM 视角的反思

## 6.1 RAG 项目的 10 个常见陷阱

1. **盲目跟风做 RAG**——不是所有 AI 问答都需要 RAG，先问"我的问题领域 LLM 训练数据覆盖了吗"
2. **embedding 模型用得不对**——中文项目用 OpenAI ada（早期版）效果差，必须挑专门优化中文的
3. **chunk 切得太碎或太大**——切碎丢上下文，太大召回不准（南渡因为 archive 短，反而不切）
4. **threshold 没调过**——0 阈值收一堆噪声，太高漏召回。必须实验
5. **TopK 贪多**——topK=10 比 topK=4 慢 + 贵 + 注意力稀释
6. **prompt 不写引用规则**——LLM 默认乱标，前端渲染崩
7. **没有"史料为空"兜底**——空命中时模型编造
8. **citations 不前置发**——用户等 LLM 慢慢吐字，焦虑感拉满
9. **admin 改数据后忘了重 embed**——向量库跟主表脱节，"我明明改了为什么 AI 还说旧的"
10. **不做评测就上线**——上线第二天发现关键 query 召不回来，已经被用户骂了

南渡 AI 把这 10 个全部走过/避过一遍 —— 这就是这个项目作为 AIPM 学习材料的价值。

## 6.2 如何向非技术 stakeholder 沟通 AI 质量

评委 / 老板 / 客户问"你这 AI 准不准"，怎么答？

**糟糕的答法**：
- "我们用了 RAG + DeepSeek，cosine 相似度 0.40 阈值……" ← 对方听不懂
- "挺准的" ← 对方不信
- "你试试看" ← 对方试了发现一个错的，全盘否定

**好的答法（3 段式）**：
1. **承认局限**："AI 不是百科全书，它的知识范围限于我们已经录入向量库的 X 条史料"
2. **展示机制**："你看每条回答下面都有溯源卡片，这就是 AI 真实参考的资料；如果史料里没有相关内容，AI 会主动说'馆藏档案暂无相关条目'，不会编造"（演示一下脱题 query → '馆藏档案暂无相关条目'的 fallback）
3. **量化承诺**："我们用 5 个代表性问题做了测试，召回率 100%，平均响应 2 秒"（不要说 95% 这种没证据的数字）

**关键是给对方一个"可验证的边界"**——而不是承诺"我们的 AI 什么都行"。

## 6.3 RAG 成本经济学

| 成本项 | 一次性 vs 持续 | 主要影响因素 |
|---|---|---|
| Embed 数据（全量初始化）| 一次性 | 数据量 |
| Embed 数据（增量）| 持续 | 数据增长率 |
| Embed query | 持续 | DAU × 平均会话深度 |
| LLM 推理 | 持续 | DAU × 平均会话深度 × topK × 历史长度 |
| 向量库存储 | 持续 | 数据量（但便宜） |
| LLM 训练（fine-tune）| 一次性 | 数据量 + epoch 数 |

**杠杆**：
- 控数据量增长（剔重 / 合并相似条目）
- 控 topK（4 比 8 便宜一半）
- 控 history（多轮裁剪到最近 N 轮）
- 控 system prompt 长度（每减 100 tokens × 1 万 query/天 = 省 1M tokens/天）

## 6.4 何时该 fine-tune、何时该 RAG、何时该混合

| 需求 | 选择 |
|---|---|
| "AI 要回答我项目的专业知识，知识在变" | RAG |
| "AI 要按我们品牌特定的语调说话" | Fine-tune |
| "AI 要按我们流程做特定任务（如工单分类）" | Fine-tune |
| "AI 要回答专业知识 + 特定语调" | RAG + Fine-tune（南渡现在用 system prompt 模拟语调，规模化后可考虑 fine-tune）|
| "AI 要从结构化数据查询（库存、订单）" | Function Calling，不是 RAG |
| "AI 要做长链推理 / 数学" | 选强推理 LLM（GPT-4o / Claude），不是改架构 |

**AIPM 的判断框架**：
- 知识可变 → RAG
- 行为/风格定制 → Fine-tune
- 数据库查询 → Function Calling
- 推理任务 → 换更强 LLM

---

# 第 7 部分 · 未做的工作 + 改进路线

按重要度排序，每条都是真实可做的下一步：

## 7.1 多轮对话 token 裁剪（高优先 / 上线必做）

**问题**：useChat 默认把完整 history 每次都发给 LLM。10 轮对话后 prompt 可能 5000+ tokens，**90% 是历史而非当前 query**。

**方案**：
- 只发最近 N 轮（如 4 轮）
- 或用 LLM 自己总结历史（"summary memory"）

**影响**：成本省 50-70%，响应快 30%

## 7.2 长文档（PDF）切块支持（演示后）

5/11 已锁方案 C：admin 上传 PDF → 后台切块 → 每块单独 embed → 检索时返回 (archive_id, page_no, chunk_text) → Lightbox 跳到对应页。

**为什么演示前不做**：当前 archive 全是短描述，不需要切块。PDF 进来才需要。

## 7.3 速率限制

**问题**：DeepSeek API 没限流，恶意用户能刷死你账户。

**方案**：用 Vercel 的 rate limit 中间件 / Upstash Redis token bucket / 简单的 IP-based 计数。

**演示规模不必，上线必加**。

## 7.4 嵌入模型升级路径

DashScope text-embedding-v3 → v4（如果出）/ BGE-M3（开源）

**注意**：换模型 = 重 embed 全量数据 = `npm run embed:archives -- --all`。如果数据多（百万级）会是个工程任务。

## 7.5 Hybrid Retrieval（关键词 + 向量）

**场景**：用户问"碧色寨车站"——这是个专有名词，关键词匹配也很有效；但如果向量召回把它排到第 3 反而绕路。

**方案**：BM25（关键词）+ Vector（语义）双路召回 + RRF（reciprocal rank fusion）合并。

**何时做**：用户日志显示有"专有名词召回不准"的模式时。

## 7.6 RAGAS / 自动评测

参见 §4.4。

## 7.7 Reranker（提升精排）

**场景**：召回的 topK 中，第 4 条其实比第 1 条更相关。

**方案**：用一个轻量 cross-encoder 模型（如 BGE-Reranker）对 topK 做精排。

**何时做**：用户反馈有"明明有更好的史料但 AI 没用到"的模式。

---

# 附录 A · 推荐学习资源

| 类别 | 资源 |
|---|---|
| **入门概念** | [DeepLearning.AI 的 RAG 短课](https://www.deeplearning.ai/short-courses/) |
| **vector DB 原理** | Pinecone learn 系列（虽然是销售文，原理写得清楚） |
| **prompt engineering** | OpenAI Cookbook + Anthropic Prompt Library |
| **RAG 最佳实践** | LangChain / LlamaIndex 官方文档（看架构思路，不必用它们的代码）|
| **评测** | RAGAS GitHub README + 论文 https://arxiv.org/abs/2309.15217 |
| **chunking 策略** | "Chunking strategies for LLM applications" - Pinecone blog |
| **lost in the middle** | https://arxiv.org/abs/2307.03172 |
| **AIPM 通识** | 红杉资本 / a16z 的 AI agent / RAG 类 blog |

---

# 附录 B · 实操作业（自学验收用）

如果你想验证自己真的学懂了，做完这 7 个练习：

1. **画图**：合上文档，把 §1.5 的 RAG 流程图自己重画一遍（包括离线 + 在线两段）
2. **复述**：用大白话给一个非技术的朋友讲清楚"什么是 RAG、为什么我们项目要用它"——不超过 3 分钟
3. **改阈值实验**：把 retrieve.ts 的 threshold 改成 0.20 和 0.50，分别跑 smoke-retrieve.ts，对比命中变化，写一段分析（参考 §3.6 的实验报告格式）
4. **加一条 query**：往 smoke-retrieve.ts 加一条你自己设计的 query（要测试一个新的语义类型），说明你为什么选这条
5. **prompt 改写**：尝试把 system-prompt.ts 的 5 条 RAG 规则压缩到 3 条，看看 LLM 输出有什么变化（用浏览器实测）
6. **决策对比**：假设要把这个项目从 100 条档案扩展到 100 万条文档（如全云南省档案数字化），重新审视 §3 的 12 个决策——哪些要变？为什么？
7. **写一个 Decision Note**：模仿 5/13/15 日志里的 Decision Note 格式，为"是否引入 reranker"写一份决策建议（包括 PM 视角的成本/收益权衡）

---

# 附录 C · 词汇表

| 词 | 含义 |
|---|---|
| **RAG** | Retrieval-Augmented Generation, 检索增强生成 |
| **Embedding** | 把文本编码为高维数字向量的过程 |
| **Vector DB** | 专门存储和检索向量的数据库 |
| **pgvector** | Postgres 的向量扩展 |
| **HNSW** | Hierarchical Navigable Small World, 一种近似最近邻索引算法 |
| **Cosine similarity** | 余弦相似度，衡量两向量方向相似度的指标 |
| **Chunk** | 把长文档切成的"块"，每块独立 embed |
| **TopK** | 检索返回前 K 条最相关结果 |
| **Threshold** | 相似度阈值，低于此分数的结果不返回 |
| **Anchor** | 用户进入对话时携带的"上下文焦点"（如某个 archive ID） |
| **System prompt** | 给 LLM 的"角色 + 规则"指令，每次对话开头都会注入 |
| **Streaming** | LLM 边生成边返回的模式（vs 一次性返回完整答案） |
| **Citation** | 答案中引用的史料来源 |
| **Hybrid Retrieval** | 关键词检索 + 向量检索结合 |
| **Reranker** | 对召回结果做精排的二次模型 |
| **Faithfulness** | 答案是否忠实于检索到的上下文（不编造）|
| **Hallucination** | 模型幻觉，编造不存在的事实 |
| **Lost in the middle** | 长上下文中模型对中段内容关注度下降的现象 |

---

# 结语

南渡 AI 不是一个"完美"的 RAG 系统——它有很多简化、很多妥协、很多"等上线后再说"的 backlog。但**正因为它简单**，每个决策都看得清"为什么这么做"。

如果你能把这份文档读 3 遍，对照源码看 3 遍，自己动手改 3 处——你已经超过 80% 自称懂 RAG 的 PM 了。

记住一句话：

> **AIPM 的核心能力不是知道"最新技术是什么"，而是知道"在自己的产品里，哪个技术值得用、值不值得花这个工程预算"。**

技术是工具，决策才是产品。

—— 写于 2026-05-16，距汇报截止 5/23 还有 7 天

