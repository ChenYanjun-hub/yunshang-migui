import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ArchiveForm from '../../ArchiveForm';
import { updateArchive } from '../../actions';

export default async function EditArchivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('archives')
    .select('id, title, category, era, year, description, source, author, status, image_urls, image_height')
    .eq('id', id)
    .single();
  if (error || !data) notFound();

  const action = updateArchive.bind(null, id);

  return <ArchiveForm mode="edit" initial={data} action={action} />;
}
