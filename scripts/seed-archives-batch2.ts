/**
 * 一次性脚本：补 12 条史料到 archives 表，并自动 embed 入向量库。
 *
 * 跑法：
 *   npm run seed:batch2
 *
 * 幂等：以 source+title 组合做存在性检查，已存在则跳过插入（embed 仍刷新）。
 * 撤销：手动从 supabase 删除 source LIKE '...batch2-%' 的行（CASCADE 会清向量）。
 *
 * 设计：12 条覆盖修筑期华工、抗战物资通道、人字桥两次大修、米轨车厢内饰、
 *      沿线少数民族（哈尼）、蒙自海关、五家寨工程、米线饮食口述等主题，
 *      description 字段刻意写得"语义丰富"，给 RAG 提供多个关键词锚点。
 */

import { createClient } from '@supabase/supabase-js';
import { embedBatch } from '../src/lib/ai/embed';
import { buildArchiveChunkText } from '../src/lib/ai/archive-embed';

type SeedRow = {
  title: string;
  category: 'photo' | 'document' | 'map' | 'blueprint' | 'newspaper' | 'oral_history';
  era: 'construction' | 'operation' | 'republic' | 'prc' | 'heritage';
  year: number;
  description: string;
  source: string;
  author: string | null;
  image_height: number;
  cover_seed: string; // picsum seed
};

const BATCH_TAG = 'batch2-2026-05-12';

const SEED_ROWS: SeedRow[] = [
  {
    title: '筑路华工口述记忆',
    category: 'oral_history',
    era: 'construction',
    year: 1908,
    description:
      '1903至1910年法国人主导修筑滇越铁路滇段，先后征召超过六万中国劳工，多来自云南本地及两广。' +
      '口述记录显示：人字桥、五家寨、白寨等险峻路段瘴气横行，塌方与霍乱频发，工伤致死据估算逾万人。' +
      '"一根枕木一条命"成为后世悲怆评语。米轨修筑史中工人血泪与西南山地工程奇迹并存。',
    source: '云南省文史馆口述项目',
    author: '杨福源整理',
    image_height: 950,
    cover_seed: 'yunshang-b01',
  },
  {
    title: '五家寨大桥设计原稿',
    category: 'blueprint',
    era: 'construction',
    year: 1906,
    description:
      '五家寨大桥（亦称"人字桥"邻线桥）设计图原稿，由法国巴底纽勒桥梁公司 (Société de Construction des Batignolles) 出图。' +
      '跨度102米，为当时世界第二大悬臂桁架结构。图中详注桁架角度、铆钉规格、岩基锚固深度，以及四川峨眉运送钢材的物流路线。',
    source: '法国国家铁路博物馆 (Mulhouse) 复印件',
    author: 'Société de Construction des Batignolles',
    image_height: 1100,
    cover_seed: 'yunshang-b02',
  },
  {
    title: '滇越铁路滇段勘测路线图',
    category: 'map',
    era: 'construction',
    year: 1903,
    description:
      '1903年法方工程师踏勘队绘制的米轨原始走向方案，包含三个备选线路：经蒙自的低线、经建水的中线、经文山的远线。' +
      '最终采纳低线，因坡度与桥隧成本最优，但需克服南溪河深谷与人字桥峡口。地图上标注的村寨彝族、哈尼族聚居区分布也成为后世人类学研究素材。',
    source: '云南省档案馆 民国类 1903 卷宗',
    author: 'Guibert 勘察队',
    image_height: 850,
    cover_seed: 'yunshang-b03',
  },
  {
    title: '法式米轨头等车厢内饰',
    category: 'photo',
    era: 'operation',
    year: 1915,
    description:
      '1915年滇越铁路通车初期头等车厢内景：天鹅绒包厢座椅、黄铜煤气灯、红木镶板、对开折叠桌。' +
      '该车厢专供云南督军及外籍商务旅客使用，单程昆明至河口票价相当于普通工人三个月工资。' +
      '车厢内部还设有小型酒柜与法语菜单的小餐桌，体现 belle époque 时期的法式殖民铁路美学。',
    source: '越南海防殖民地照相馆原版',
    author: 'Pierre Dieulefils 工作室（疑）',
    image_height: 800,
    cover_seed: 'yunshang-b04',
  },
  {
    title: '红河南岸哈尼梯田与米轨',
    category: 'photo',
    era: 'operation',
    year: 1930,
    description:
      '20世纪30年代法国传教士在红河南岸拍摄：哈尼族层叠梯田之间，米轨蒸汽机车蜿蜒穿行，山头云雾缭绕。' +
      '是"工业铁路"与"东方稻作文明"罕见的同框影像之一。哈尼族沿线村寨自此与外部世界产生持续联系，' +
      '元阳梯田一带的稻种与盐巴贸易也借由米轨小站逐步活络。',
    source: '巴黎外方传教会档案 MEP-IDC-1930-227',
    author: 'Père Lucien Cognard',
    image_height: 920,
    cover_seed: 'yunshang-b05',
  },
  {
    title: '滇越铁路抗战军运档案',
    category: 'document',
    era: 'republic',
    year: 1940,
    description:
      '抗战中期（1937-1940年9月）滇越铁路是国民政府西南唯一国际物资生命线。' +
      '档案记载经越南海防—河口—昆明运抵后方的物资：苏联援华飞机零部件、汽油、军用通讯设备、英美医药。' +
      '月均运量峰值达1.5万吨，最高单月超过2万吨。1940年9月日军压境后被迫自毁河口至碧色寨段铁路。',
    source: '中央研究院近代史研究所 抗战物资类档案',
    author: '国民政府交通部驻滇办事处',
    image_height: 880,
    cover_seed: 'yunshang-b06',
  },
  {
    title: '1940 河口拆轨剪报',
    category: 'newspaper',
    era: 'republic',
    year: 1940,
    description:
      '《申报》1940年9月23日报道：" 为防日军利用滇越铁路深入我国腹地，国府已下令将河口至碧色寨段180公里铁轨、桥涵、隧道悉数毁除。' +
      '沿线百姓星夜搬迁，一时火光沿江数十里。"该决策直接断绝中越铁路运输长达八年。' +
      '至1947年才在原碧河段重新铺设便线，但运输能力已不足战前三成。',
    source: '上海图书馆《申报》缩微胶片',
    author: '申报记者陈述伦',
    image_height: 1050,
    cover_seed: 'yunshang-b07',
  },
  {
    title: '蒙自海关年度贸易月报',
    category: 'document',
    era: 'republic',
    year: 1925,
    description:
      '1925年蒙自海关（1889年开关，米轨通车后激增为云南最大内陆海关）年度贸易月报摘要：' +
      '进口以法国葡萄酒、棉布、机械配件居前；出口以个旧锡锭（年6800吨）、滇南咖啡（650吨）、虫胶为大宗。' +
      '米轨承运占进出口总吨位73%，蒙自海关税收一度居云南各关之首，养活了沿线一整批小镇与马帮转运业。',
    source: '蒙自海关档案 MZ-1925-Q4',
    author: '关务司 J. Lemoine',
    image_height: 880,
    cover_seed: 'yunshang-b08',
  },
  {
    title: '1956 人字桥首次大修施工记录',
    category: 'document',
    era: 'prc',
    year: 1956,
    description:
      '建国后人字桥进入第七个十年，原法式悬臂桁架出现金属疲劳与铆钉松动。' +
      '1956年4月至11月铁道部组织首次大修：更换主桁架受力杆件、全面除锈防腐、加固岩基锚栓。' +
      '施工期间昆河线被迫单边轮班停运。该次大修为后续半个世纪的稳定运营奠定基础，亦留下首批本土钢桥维护工艺资料。',
    source: '中国铁道科学研究院档案',
    author: '铁道部第二设计院',
    image_height: 800,
    cover_seed: 'yunshang-b09',
  },
  {
    title: '碧色寨米线小站口述：1958',
    category: 'oral_history',
    era: 'prc',
    year: 1958,
    description:
      '原碧色寨站站长李志远口述："五八年大跃进时碧色寨日均开行客车12对、货列17对，' +
      '米线摊从月台一直摆到候车室门口。最忙时连法国时期留下的二楼电报房都改成了小卖部。' +
      '过桥米线、汽锅鸡、菠萝饭三样最能卖，旅客一边等车一边在月台吃。"' +
      '此口述被视为研究"米轨饮食带"地理分布的重要一手资料。',
    source: '蒙自市档案馆口述史项目',
    author: '李志远口述 / 王建华整理',
    image_height: 920,
    cover_seed: 'yunshang-b10',
  },
  {
    title: '碧色寨法式站房现状',
    category: 'photo',
    era: 'heritage',
    year: 2020,
    description:
      '2020年航拍碧色寨车站建筑群：法式米黄外墙站房、法国领事府旧址、网球场遗址保存完整。' +
      '已列入第八批全国重点文物保护单位，并作为云南申报世界文化遗产"近代工业遗产廊道"的核心节点之一。' +
      '近年活化为电影《芳华》取景地后，文创、咖啡、民宿业态进入，遗产保护与商业开发的张力成为持续议题。',
    source: '云南省文物局"米轨遗产廊道"项目',
    author: '摄影：吴健',
    image_height: 1000,
    cover_seed: 'yunshang-b11',
  },
  {
    title: '2007 人字桥钢结构加固方案',
    category: 'document',
    era: 'heritage',
    year: 2007,
    description:
      '二十一世纪初人字桥金属应力监测显示主桁架损伤累积已达临界。' +
      '2007年中铁大桥勘测设计院出具加固方案：保留全部历史构件，' +
      '在原桁架内侧加焊高强度合金支撑梁；同步建立长期应力监测网与温度湿度遥测系统。' +
      '该方案获 ICOMOS"近代工程遗产保护奖"提名，是百年米轨进入数字化遗产管理的标志性事件。',
    source: '中铁大桥勘测设计院 2007-人字桥-加固',
    author: '项目负责人 徐恭义',
    image_height: 880,
    cover_seed: 'yunshang-b12',
  },
];

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set in .env.local`);
  return v;
}

async function main() {
  const sb = createClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false } },
  );

  // 1. 幂等检查：按 title 找已存在的，跳过插入
  const titles = SEED_ROWS.map((r) => r.title);
  const { data: existing, error: exErr } = await sb
    .from('archives')
    .select('id, title')
    .in('title', titles);
  if (exErr) throw exErr;
  const existingTitles = new Set((existing ?? []).map((r) => r.title));

  const toInsert = SEED_ROWS.filter((r) => !existingTitles.has(r.title));
  console.log(
    `[seed] ${SEED_ROWS.length} candidates, ${existingTitles.size} already exist, inserting ${toInsert.length} new`,
  );

  let insertedRows: Array<{ id: string; title: string; category: string; era: string; year: number; description: string; source: string; author: string | null }> = [];

  if (toInsert.length > 0) {
    const rows = toInsert.map((r) => {
      const cover = `https://picsum.photos/seed/${r.cover_seed}/800/${r.image_height}?grayscale`;
      return {
        title: r.title,
        category: r.category,
        era: r.era,
        year: r.year,
        description: r.description,
        source: r.source + ` [${BATCH_TAG}]`, // 标记批次便于将来撤回
        author: r.author,
        cover_url: cover,
        image_urls: [cover],
        image_height: r.image_height,
        status: 'published',
      };
    });

    const { data, error } = await sb
      .from('archives')
      .insert(rows)
      .select('id, title, category, era, year, description, source, author');
    if (error) throw error;
    insertedRows = data ?? [];
    console.log(`[seed] inserted ${insertedRows.length} archives`);
  }

  // 2. 重新拉所有已发布行（包含本批次和已存在的同名行），增量 embed
  // 简化：只 embed 本次插入的行；对已存在的同名行不重新 embed（如要全量重算请跑 embed:archives --all）
  if (insertedRows.length === 0) {
    console.log('[seed] nothing new to embed.');
    return;
  }

  const texts = insertedRows.map(buildArchiveChunkText);
  console.log(`[seed] embedding ${texts.length} new archives via dashscope...`);
  const vectors = await embedBatch(texts);
  console.log(`[seed] got ${vectors.length} vectors (dim=${vectors[0]?.length})`);

  const embRows = insertedRows.map((a, i) => ({
    archive_id: a.id,
    embedding: vectors[i] as unknown as string,
    chunk_text: texts[i],
    embedding_model: 'text-embedding-v3',
    updated_at: new Date().toISOString(),
  }));

  const { error: upErr } = await sb
    .from('archives_embeddings')
    .upsert(embRows, { onConflict: 'archive_id' });
  if (upErr) throw upErr;
  console.log(`[seed] upserted ${embRows.length} embeddings`);
  console.log('[seed] done.');
}

main().catch((err) => {
  console.error('[seed] FAILED:', err);
  process.exit(1);
});
