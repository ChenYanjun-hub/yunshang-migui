'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type GalleryFormState = { error?: string; ok?: boolean };

const ALLOWED_STATUS = ['draft', 'published', 'archived'];

function parsePayload(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const author = String(formData.get('author') ?? '').trim();
  const story = String(formData.get('story') ?? '').trim();
  const takenAtRaw = String(formData.get('taken_at') ?? '').trim();
  const status = String(formData.get('status') ?? 'draft').trim();
  const photoUrlsRaw = String(formData.get('photo_urls') ?? '[]');

  if (!title) return { error: '请填写标题' as const };
  if (!ALLOWED_STATUS.includes(status)) return { error: '状态非法' as const };

  let photo_urls: string[] = [];
  try { photo_urls = JSON.parse(photoUrlsRaw); } catch { photo_urls = []; }
  if (!Array.isArray(photo_urls) || photo_urls.length === 0) {
    return { error: '请上传至少一张照片' as const };
  }

  return {
    payload: {
      title,
      author: author || null,
      story: story || null,
      taken_at: takenAtRaw || null,
      status,
      photo_url: photo_urls[0],
    },
  };
}

export async function createGalleryPhoto(
  _prev: GalleryFormState,
  formData: FormData
): Promise<GalleryFormState> {
  const parsed = parsePayload(formData);
  if ('error' in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '未登录' };

  const { error } = await supabase
    .from('gallery_photos')
    .insert({ ...parsed.payload, created_by: user.id });
  if (error) return { error: error.message };

  revalidatePath('/admin/gallery');
  revalidatePath('/exhibition');
  redirect('/admin/gallery');
}

export async function updateGalleryPhoto(
  id: string,
  _prev: GalleryFormState,
  formData: FormData
): Promise<GalleryFormState> {
  const parsed = parsePayload(formData);
  if ('error' in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from('gallery_photos')
    .update({ ...parsed.payload, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/gallery');
  revalidatePath('/exhibition');
  redirect('/admin/gallery');
}

export async function deleteGalleryPhoto(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('gallery_photos').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/gallery');
  revalidatePath('/exhibition');
}

export async function setGalleryPhotoStatus(
  id: string,
  status: 'draft' | 'published' | 'archived'
) {
  if (!ALLOWED_STATUS.includes(status)) throw new Error('状态非法');
  const supabase = await createClient();
  const { error } = await supabase
    .from('gallery_photos')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/gallery');
  revalidatePath('/exhibition');
}
