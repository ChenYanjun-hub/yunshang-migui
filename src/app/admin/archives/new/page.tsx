import ArchiveForm from '../ArchiveForm';
import { createArchive } from '../actions';

export default function NewArchivePage() {
  return <ArchiveForm mode="create" action={createArchive} />;
}
