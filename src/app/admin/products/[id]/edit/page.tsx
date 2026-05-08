import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '../../ProductForm';
import { updateProduct } from '../../actions';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, description, category, status, image_urls')
    .eq('id', id)
    .single();
  if (error || !data) notFound();

  const action = updateProduct.bind(null, id);
  return <ProductForm mode="edit" initial={data} action={action} />;
}
