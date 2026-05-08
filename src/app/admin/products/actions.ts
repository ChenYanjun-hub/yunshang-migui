'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type ProductFormState = { error?: string; ok?: boolean };

const ALLOWED_STATUS = ['on_shelf', 'off_shelf'];

function parsePayload(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const priceRaw = String(formData.get('price') ?? '0').trim();
  const description = String(formData.get('description') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const status = String(formData.get('status') ?? 'off_shelf').trim();
  const imageUrlsRaw = String(formData.get('image_urls') ?? '[]');

  if (!name) return { error: '请填写名称' as const };
  const price = Number(priceRaw);
  if (Number.isNaN(price) || price < 0) return { error: '价格非法' as const };
  if (!ALLOWED_STATUS.includes(status)) return { error: '状态非法' as const };

  let image_urls: string[] = [];
  try { image_urls = JSON.parse(imageUrlsRaw); } catch { image_urls = []; }
  if (!Array.isArray(image_urls)) image_urls = [];

  return {
    payload: {
      name,
      price,
      description: description || null,
      category: category || null,
      status,
      image_urls,
      cover_url: image_urls[0] ?? null,
    },
  };
}

export async function createProduct(_p: ProductFormState, fd: FormData): Promise<ProductFormState> {
  const parsed = parsePayload(fd);
  if ('error' in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '未登录' };

  const { error } = await supabase.from('products').insert({ ...parsed.payload, created_by: user.id });
  if (error) return { error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/store');
  redirect('/admin/products');
}

export async function updateProduct(id: string, _p: ProductFormState, fd: FormData): Promise<ProductFormState> {
  const parsed = parsePayload(fd);
  if ('error' in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from('products')
    .update({ ...parsed.payload, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/store');
  redirect('/admin/products');
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
  revalidatePath('/store');
}

export async function setProductStatus(id: string, status: 'on_shelf' | 'off_shelf') {
  if (!ALLOWED_STATUS.includes(status)) throw new Error('状态非法');
  const supabase = await createClient();
  const { error } = await supabase.from('products')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
  revalidatePath('/store');
}
