'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { deleteArchive, setArchiveStatus } from './actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function RowActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [pending, start] = useTransition();

  function onDelete() {
    if (!confirm('删除后不可恢复，确认删除？')) return;
    start(async () => {
      try { await deleteArchive(id); } catch (e) { alert((e as Error).message); }
    });
  }

  function onStatus(next: 'draft' | 'published' | 'archived') {
    start(async () => {
      try { await setArchiveStatus(id, next); } catch (e) { alert((e as Error).message); }
    });
  }

  const btn = 'text-[10px] tracking-[0.3em] uppercase italic transition-colors';

  return (
    <div className="flex items-center gap-3" style={enFont}>
      <Link href={`/admin/archives/${id}/edit`} className={`${btn} text-text-secondary hover:text-accent`}>
        Edit
      </Link>
      {status !== 'published' && (
        <button onClick={() => onStatus('published')} disabled={pending} className={`${btn} text-text-secondary hover:text-accent disabled:opacity-50`}>
          Publish
        </button>
      )}
      {status !== 'draft' && (
        <button onClick={() => onStatus('draft')} disabled={pending} className={`${btn} text-text-secondary hover:text-accent disabled:opacity-50`}>
          Draft
        </button>
      )}
      {status !== 'archived' && (
        <button onClick={() => onStatus('archived')} disabled={pending} className={`${btn} text-text-secondary hover:text-accent disabled:opacity-50`}>
          Archive
        </button>
      )}
      <button onClick={onDelete} disabled={pending} className={`${btn} text-red-500/80 hover:text-red-500 disabled:opacity-50`}>
        Delete
      </button>
    </div>
  );
}
