'use client';

import { useActionState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addComment, type CommentFormState } from './actions';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function CommentForm({ postId, isAuthed }: { postId: string; isAuthed: boolean }) {
  const action = addComment.bind(null, postId);
  const [state, formAction, pending] = useActionState<CommentFormState, FormData>(action, {});
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!pending && !state?.error && ref.current) {
      ref.current.reset();
    }
  }, [pending, state]);

  if (!isAuthed) {
    return (
      <div className="border border-dashed border-border-subtle p-6 text-center text-sm text-text-muted">
        <button
          onClick={() => router.push(`/auth/login?redirect=/community/${postId}`)}
          className="text-accent hover:underline italic"
          style={enFont}
        >
          登录后参与讨论 →
        </button>
      </div>
    );
  }

  return (
    <form ref={ref} action={formAction} className="border-t border-border-subtle pt-6">
      <textarea
        name="content"
        required
        rows={3}
        placeholder="说点什么…"
        className="w-full bg-transparent border border-border-hard px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors resize-y"
      />
      {state?.error && (
        <p className="text-sm text-red-500 border-l-2 border-red-500 pl-3 mt-2">{state.error}</p>
      )}
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 bg-accent text-background text-xs tracking-[0.3em] uppercase italic hover:opacity-80 transition-opacity disabled:opacity-50"
          style={enFont}
        >
          {pending ? 'Sending…' : 'Reply'}
        </button>
      </div>
    </form>
  );
}
