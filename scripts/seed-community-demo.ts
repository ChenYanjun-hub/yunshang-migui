/**
 * 一次性脚本：注入 5 条 demo 社区帖，并清掉早期测试帖。
 *
 * 跑法：
 *   npm run seed:community
 *
 * 设计：
 *   - 覆盖 4 种 tag：memory(2) / photo(1) / checkin(1) / other(1)
 *   - 帖子 author 全部归到一个 admin 用户名下（演示足够；真实运营改 UGC）
 *   - 幂等：以 title 唯一性兜底，已存在则跳过；清测试帖按 content 包含
 *     "这是一个测试" 匹配
 *   - 撤销：手动 SQL —— delete from posts where content like '%[demo-2026-05-17]%'
 *
 * 注意：因为没有"管理 UI"，演示前若需重置或扩容，重跑此脚本即可
 *      （5/18 完整 admin/community 上线后将由后台接管）
 */

import { createClient } from '@supabase/supabase-js';

const BATCH_TAG = '[demo-2026-05-17]';

type SeedPost = {
  title: string;
  content: string;
  tag: 'memory' | 'photo' | 'checkin' | 'other';
  image_seeds: string[]; // picsum seeds，留空则不带图
};

const SEED_POSTS: SeedPost[] = [
  {
    title: '父亲在开远机务段的三十年',
    tag: 'memory',
    image_seeds: ['migui-kaiyuan-1', 'migui-kaiyuan-2'],
    content:
      '父亲 1968 年从昆明铁路司机学校毕业，分到开远机务段，一干就是三十年。他常说米轨蒸汽机车难开 ——\n' +
      '坡度大、半径小，从碧色寨到河口那段，下坡得"叠风闸"四五次才稳得住。\n' +
      '小时候我跟车体验过一次："咕咚咕咚"声音不是机车声，是钢轨接口的回响，米轨轨距窄、轨枕密，' +
      '走起来比准轨"碎"得多。\n\n' +
      '后来内燃替代蒸汽，他改开 DF21，但还是念叨"蒸汽机车有性格，内燃机像没温度的铁罐子"。\n' +
      '老照片在抽屉最底层，铜把手已经被他摩挲得发亮。',
  },
  {
    title: '1985 年蒙自站全家福',
    tag: 'photo',
    image_seeds: ['migui-mengzi-photo'],
    content:
      '这是父母带我和弟弟在蒙自站站台拍的全家福，1985 年五一。\n' +
      '当时蒙自站是滇南最热闹的米轨车站之一，月台上挤满了挑担的小贩 —— 卖过桥米线、烤洋芋、' +
      '碗筒粉，叫卖声此起彼伏。\n\n' +
      '现在站房法式百叶窗还在，但月台已经停运。母亲已不在，弟弟也定居广州十年没回。\n' +
      '照片背后母亲写着一行字："孩子们以后一定要再来"。',
  },
  {
    title: '五一徒步白寨大桥：一段被遗忘的米轨工程',
    tag: 'checkin',
    image_seeds: ['migui-baizhai-1', 'migui-baizhai-2', 'migui-baizhai-3'],
    content:
      '今年五一组队走了白寨大桥到芷村段，全程 18 公里。\n\n' +
      '白寨大桥（1908 年建，47 米单孔石拱）目前已停用，但桥体保存极好，桥下是南溪河的支流。' +
      '当地老乡说每年雨季还有山民赶着马帮从桥上过 —— "比绕公路省两小时"。\n\n' +
      '推荐装备：徒步鞋（轨枕缝隙容易扭脚）、长袖（蚂蟥）、至少 2L 水。\n' +
      '不推荐：暴雨后第二天，路基松软有塌方风险。',
  },
  {
    title: '碧色寨「时光小站」咖啡馆探店',
    tag: 'checkin',
    image_seeds: ['migui-bisezhai-cafe'],
    content:
      '碧色寨车站旁的「时光小站」咖啡馆，开在原法国领事府旧址翻修的二层木楼里。\n' +
      '推荐：滇红挂耳 + 玫瑰鲜花饼，米轨主题马克杯（80 元，款式不少）。\n\n' +
      '坐落位置极好：从二楼窗能直接看到老月台的钢轨和站房法式时钟，下午 4 点逆光拍摄最佳。\n' +
      '人均 ¥45，工作日下午基本不用排队。\n\n' +
      '提醒：店里有一面墙贴满老照片，欢迎自己带照片去拓印 —— 老板娘是当地铁路职工后代。',
  },
  {
    title: '收藏分享：1972 年米轨模型 + 蒸汽机车工程图',
    tag: 'other',
    image_seeds: ['migui-model-1', 'migui-model-2'],
    content:
      '入坑米轨模型十年，最近收到一个朋友转让的 1972 年昆明铁路局赠送的 1:50 米轨蒸汽机车' +
      '模型（黄铜车体，KD7 型），配套还有一张原版蒸汽机车工程图（蓝晒图，A2 大小）。\n\n' +
      '总价 4800，对收藏圈来说算合理。出让方说原主人是老一辈米轨司机，去世前嘱咐"找个真懂的人"。\n' +
      '我已在书房专门腾了一面玻璃柜，配米轨主题氛围灯。\n\n' +
      '同好欢迎私信交流，正在搜罗 SY 型蒸汽机的资料，有线索请告知。',
  },
];

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set in .env.local`);
  return v;
}

async function main() {
  const supabase = createClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false } },
  );

  // 1) 找一个 admin 用户作为 author（不存在就报错让用户先创建）
  const { data: admin, error: adminErr } = await supabase
    .from('profiles')
    .select('id, role, nickname')
    .in('role', ['admin_ops', 'super_admin'])
    .limit(1)
    .maybeSingle();

  if (adminErr) throw adminErr;
  if (!admin) {
    throw new Error(
      '找不到 admin 用户。请先在 Supabase Dashboard 注册一个账号，并把 profiles.role 设为 admin_ops 或 super_admin。',
    );
  }
  console.log(`[seed] author = ${admin.nickname ?? admin.id.slice(0, 8)} (${admin.role})`);

  // 2) 清掉早期测试帖（content 包含 "这是一个测试"）
  const { data: testPosts, error: findErr } = await supabase
    .from('posts')
    .select('id, title')
    .ilike('content', '%这是一个测试%');
  if (findErr) throw findErr;
  if (testPosts && testPosts.length > 0) {
    const ids = testPosts.map((p) => p.id);
    // 评论 + 点赞先清（FK CASCADE 应该自动，但显式做一次更稳）
    await supabase.from('comments').delete().in('post_id', ids);
    await supabase.from('post_likes').delete().in('post_id', ids);
    const { error: delErr } = await supabase.from('posts').delete().in('id', ids);
    if (delErr) throw delErr;
    console.log(`[seed] 清掉测试帖 ${testPosts.length} 条：${testPosts.map((p) => p.title).join(', ')}`);
  } else {
    console.log('[seed] 无测试帖需清理');
  }

  // 3) 检查是否已注入过本批 demo（按 BATCH_TAG marker 在 title 末尾隐式追加）
  const { data: existing } = await supabase
    .from('posts')
    .select('title')
    .ilike('content', `%${BATCH_TAG}%`);
  if (existing && existing.length > 0) {
    console.log(`[seed] 本批 demo 已存在 ${existing.length} 条，跳过插入（要重置请先 SQL: delete from posts where content like '%${BATCH_TAG}%'）`);
    return;
  }

  // 4) 注入新帖
  const rows = SEED_POSTS.map((p) => ({
    user_id: admin.id,
    title: p.title,
    // 内容尾部隐式打 batch tag，方便回滚识别
    content: `${p.content}\n\n${BATCH_TAG}`,
    image_urls: p.image_seeds.map((s) => `https://picsum.photos/seed/${s}/900/600`),
    tag: p.tag,
    status: 'visible',
  }));

  const { error: insErr } = await supabase.from('posts').insert(rows);
  if (insErr) throw insErr;
  console.log(`[seed] 注入 ${rows.length} 条 demo 帖：${SEED_POSTS.map((p) => p.title).join(' | ')}`);
  console.log('[seed] done.');
}

main().catch((err) => {
  console.error('[seed] FAILED:', err);
  process.exit(1);
});
