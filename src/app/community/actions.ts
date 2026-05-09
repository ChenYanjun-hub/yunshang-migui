'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type PostFormState = { error?: string };
export type CommentFormState = { error?: string };

const ALLOWED_TAGS = ['memory', 'photo', 'checkin', 'other'];

export async function createPost(_p: PostFormState, fd: FormData): Promise<PostFormState> {
  const title = String(fd.get('title') ?? '').trim();
  const content = String(fd.get('content') ?? '').trim();
  const tag = String(fd.get('tag') ?? 'other').trim();
  const imageUrlsRaw = String(fd.get('image_urls') ?? '[]');

  if (!content) return { error: '请填写正文' };
  if (!ALLOWED_TAGS.includes(tag)) return { error: '标签非法' };

  let image_urls: string[] = [];
  try { image_urls = JSON.parse(imageUrlsRaw); } catch {}
  if (!Array.isArray(image_urls)) image_urls = [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '请先登录' };

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    title: title || null,
    content,
    image_urls,
    tag,
  });
  if (error) return { error: error.message };

  revalidatePath('/community');
  redirect('/community');
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/community');
  redirect('/community');
}

export async function toggleLike(postId: string): Promise<{ liked: boolean; count: number; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { liked: false, count: 0, error: '请先登录' };

  const { data: existing } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('post_likes').delete()
      .eq('post_id', postId).eq('user_id', user.id);
  } else {
    await supabase.from('post_likes').insert({
      post_id: postId, user_id: user.id,
    });
  }

  // 重算 likes_count（演示规模，简单可靠）
  const { count } = await supabase
    .from('post_likes')
    .select('post_id', { count: 'exact', head: true })
    .eq('post_id', postId);

  await supabase.from('posts')
    .update({ likes_count: count ?? 0 })
    .eq('id', postId);

  revalidatePath('/community');
  revalidatePath(`/community/${postId}`);
  return { liked: !existing, count: count ?? 0 };
}

export async function addComment(postId: string, _p: CommentFormState, fd: FormData): Promise<CommentFormState> {
  const content = String(fd.get('content') ?? '').trim();
  if (!content) return { error: '请填写内容' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '请先登录' };

  const { error } = await supabase.from('comments').insert({
    post_id: postId, user_id: user.id, content,
  });
  if (error) return { error: error.message };

  revalidatePath(`/community/${postId}`);
  revalidatePath('/community');
  return {};
}

export async function deleteComment(id: string, postId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/community/${postId}`);
}
