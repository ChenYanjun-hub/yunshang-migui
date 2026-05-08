'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type ArchiveFormState = { error?: string; ok?: boolean };

const ALLOWED_CATEGORY = ['photo', 'document', 'map', 'blueprint', 'newspaper', 'oral_history'];
const ALLOWED_ERA = ['construction', 'operation', 'republic', 'prc', 'heritage'];
const ALLOWED_STATUS = ['draft', 'published', 'archived'];

function parsePayload(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const era = String(formData.get('era') ?? '').trim();
  const yearRaw = String(formData.get('year') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const source = String(formData.get('source') ?? '').trim();
  const author = String(formData.get('author') ?? '').trim();
  const status = String(formData.get('status') ?? 'draft').trim();
  const imageUrlsRaw = String(formData.get('image_urls') ?? '[]');
  const imageHeightRaw = String(formData.get('image_height') ?? '').trim();

  if (!title) return { error: '请填写标题' as const };
  if (!ALLOWED_CATEGORY.includes(category)) return { error: '请选择类型' as const };
  if (!ALLOWED_ERA.includes(era)) return { error: '请选择时期' as const };
  if (!ALLOWED_STATUS.includes(status)) return { error: '状态非法' as const };

  let image_urls: string[] = [];
  try { image_urls = JSON.parse(imageUrlsRaw); } catch { image_urls = []; }
  if (!Array.isArray(image_urls)) image_urls = [];

  return {
    payload: {
      title,
      category,
      era,
      year: yearRaw ? Number(yearRaw) : null,
      description: description || null,
      source: source || null,
      author: author || null,
      status,
      image_urls,
      cover_url: image_urls[0] ?? null,
      image_height: imageHeightRaw ? Number(imageHeightRaw) : null,
    },
  };
}

export async function createArchive(_prev: ArchiveFormState, formData: FormData): Promise<ArchiveFormState> {
  const parsed = parsePayload(formData);
  if ('error' in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '未登录' };

  const { error } = await supabase.from('archives').insert({
    ...parsed.payload,
    created_by: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath('/admin/archives');
  revalidatePath('/archive');
  redirect('/admin/archives');
}

export async function updateArchive(id: string, _prev: ArchiveFormState, formData: FormData): Promise<ArchiveFormState> {
  const parsed = parsePayload(formData);
  if ('error' in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from('archives')
    .update({ ...parsed.payload, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/archives');
  revalidatePath('/archive');
  redirect('/admin/archives');
}

export async function deleteArchive(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('archives').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/archives');
  revalidatePath('/archive');
}

export async function setArchiveStatus(id: string, status: 'draft' | 'published' | 'archived') {
  if (!ALLOWED_STATUS.includes(status)) throw new Error('状态非法');
  const supabase = await createClient();
  const { error } = await supabase.from('archives')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/archives');
  revalidatePath('/archive');
}
