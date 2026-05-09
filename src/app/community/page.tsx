import { createClient } from '@/lib/supabase/server';
import CommunityClient from './CommunityClient';
import type { PostListItem, PostTag } from './types';

const VALID_TAGS: PostTag[] = ['memory', 'photo', 'checkin', 'other'];

type PostRow = {
  id: string;
  title: string | null;
  content: string;
  image_urls: string[] | null;
  tag: string | null;
  likes_count: number | null;
  created_at: string;
  user_id: string;
  profiles: { nickname: string | null } | null;
  comments: { count: number }[] | null;
};

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('posts')
    .select('id, title, content, image_urls, tag, likes_count, created_at, user_id, profiles!user_id(nickname), comments(count)')
    .eq('status', 'visible')
    .order('created_at', { ascending: false })
    .returns<PostRow[]>();

  const posts: PostListItem[] = (data ?? []).map((r) => {
    const tag = (VALID_TAGS.includes(r.tag as PostTag) ? r.tag : 'other') as PostTag;
    return {
      id: r.id,
      title: r.title,
      content: r.content,
      image_urls: Array.isArray(r.image_urls) ? r.image_urls : [],
      tag,
      likes_count: r.likes_count ?? 0,
      comments_count: r.comments?.[0]?.count ?? 0,
      created_at: r.created_at,
      author_id: r.user_id,
      author_nickname: r.profiles?.nickname ?? '米轨用户',
    };
  });

  let likedSet: string[] = [];
  if (user && posts.length > 0) {
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', posts.map((p) => p.id));
    likedSet = (likes ?? []).map((l) => l.post_id);
  }

  return <CommunityClient posts={posts} likedSet={likedSet} isAuthed={!!user} />;
}
