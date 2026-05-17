import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GalleryForm from '../../GalleryForm';
import { updateGalleryPhoto } from '../../actions';

export default async function EditGalleryPhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('id, title, author, story, taken_at, status, photo_url')
    .eq('id', id)
    .single();
  if (error || !data) notFound();

  const action = updateGalleryPhoto.bind(null, id);

  return <GalleryForm mode="edit" initial={data} action={action} />;
}
