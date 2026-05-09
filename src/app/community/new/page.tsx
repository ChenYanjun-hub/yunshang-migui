import { redirect } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { createClient } from '@/lib/supabase/server';
import PostForm from '../PostForm';

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/community/new');

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <PostForm />
        </div>
      </section>
    </main>
  );
}
