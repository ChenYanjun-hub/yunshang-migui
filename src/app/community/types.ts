export type PostTag = 'memory' | 'photo' | 'checkin' | 'other';

export const TAG_LABEL: Record<PostTag, string> = {
  memory: '米轨记忆',
  photo: '老照片',
  checkin: '打卡分享',
  other: '其他',
};

export const TAG_EN: Record<PostTag, string> = {
  memory: 'Memory',
  photo: 'Photo',
  checkin: 'Check-in',
  other: 'Other',
};

export type PostListItem = {
  id: string;
  title: string | null;
  content: string;
  image_urls: string[];
  tag: PostTag;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_id: string;
  author_nickname: string;
};
