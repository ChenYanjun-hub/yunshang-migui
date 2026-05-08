import ProductForm from '../ProductForm';
import { createProduct } from '../actions';

export default function NewProductPage() {
  return <ProductForm mode="create" action={createProduct} />;
}
