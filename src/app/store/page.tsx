import { createClient } from '@/lib/supabase/server';
import StoreClient, { type StoreProduct } from './StoreClient';

export default async function StorePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('id, name, price, category, cover_url, description')
    .eq('status', 'on_shelf')
    .order('created_at', { ascending: false });

  const products: StoreProduct[] = (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    category: p.category,
    cover_url: p.cover_url,
    description: p.description,
  }));

  return <StoreClient products={products} />;
}
