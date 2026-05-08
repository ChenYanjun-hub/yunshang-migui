import { createClient } from '@/lib/supabase/server';
import RoleSelect from './RoleSelect';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user: me } } = await supabase.auth.getUser();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nickname, role, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-3" style={enFont}>
        Users · 用户管理
      </p>
      <h1 className="font-serif text-3xl tracking-[0.1em] text-text-primary mb-10">
        共 {profiles?.length ?? 0} 名注册用户
      </h1>

      <div className="border border-border-subtle">
        <div className="grid grid-cols-[1fr_180px_220px] gap-4 px-5 py-3 border-b border-border-subtle bg-surface-1 text-[10px] tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>
          <span>昵称</span><span>角色（可改）</span><span>注册时间</span>
        </div>
        {profiles?.map((p) => (
          <div key={p.id} className="grid grid-cols-[1fr_180px_220px] gap-4 px-5 py-4 border-b border-border-subtle last:border-b-0 text-sm items-center">
            <span className="font-serif text-text-primary truncate">
              {p.nickname || '未命名'}
              {me?.id === p.id && <span className="ml-2 text-[10px] text-accent italic">（你）</span>}
            </span>
            <RoleSelect userId={p.id} currentRole={p.role} isSelf={me?.id === p.id} />
            <span className="text-text-muted text-xs">
              {new Date(p.created_at).toLocaleString('zh-CN')}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-text-muted leading-relaxed">
        提示：直接下拉切换角色即可保存。
      </p>
    </div>
  );
}
