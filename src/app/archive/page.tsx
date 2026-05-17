import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import ArchiveClient, { type ArchiveItem, type ArchivePeriod, type ArchiveType } from './ArchiveClient';

const VALID_PERIODS: ArchivePeriod[] = ['construction', 'operation', 'republic', 'prc', 'heritage'];
const VALID_TYPES: ArchiveType[] = ['photo', 'document', 'map', 'blueprint', 'newspaper', 'oral_history'];

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('archives')
    .select('id, title, category, era, year, description, cover_url, image_urls, source, image_height')
    .eq('status', 'published')
    .order('year', { ascending: true });

  // 把 DB 行映射为前端期待的形状；era/category 不在枚举内的条目直接跳过，避免渲染崩
  const archives: ArchiveItem[] = (data ?? [])
    .map((r): ArchiveItem | null => {
      const period = r.era as ArchivePeriod;
      const type = r.category as ArchiveType;
      if (!VALID_PERIODS.includes(period) || !VALID_TYPES.includes(type)) return null;

      const cover =
        r.cover_url ??
        (Array.isArray(r.image_urls) && r.image_urls.length > 0 ? r.image_urls[0] : null) ??
        `https://picsum.photos/seed/${r.id}/800/${r.image_height ?? 800}?grayscale`;

      return {
        id: r.id,
        title: r.title,
        period,
        type,
        year: r.year ?? 0,
        description: r.description ?? '',
        source: r.source ?? '',
        height: r.image_height ?? 800,
        coverUrl: cover,
      };
    })
    .filter((x): x is ArchiveItem => x !== null);

  // useSearchParams 在客户端组件中使用要求父侧包 Suspense 边界
  return (
    <Suspense fallback={null}>
      <ArchiveClient archives={archives} />
    </Suspense>
  );
}
