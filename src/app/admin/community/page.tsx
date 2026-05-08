const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function AdminCommunityPage() {
  return (
    <div>
      <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-3" style={enFont}>
        Community · 社区审核
      </p>
      <h1 className="font-serif text-3xl tracking-[0.1em] text-text-primary mb-10">
        帖子与评论审核
      </h1>
      <div className="border border-dashed border-border-subtle p-12 text-center text-sm text-text-muted">
        待开发：列表、隐藏、删除
      </div>
    </div>
  );
}
