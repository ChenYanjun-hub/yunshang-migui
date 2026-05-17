import GalleryForm from '../GalleryForm';
import { createGalleryPhoto } from '../actions';

export default function NewGalleryPhotoPage() {
  return <GalleryForm mode="create" action={createGalleryPhoto} />;
}
