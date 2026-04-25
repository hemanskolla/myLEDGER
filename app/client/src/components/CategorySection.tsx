import type { ContactWithNotes } from '@shared/types';
import ContactCard from './ContactCard';

interface Props {
  name: string;
  contacts: ContactWithNotes[];
  onEdit: (contact: ContactWithNotes) => void;
  onDelete: (id: number) => void;
}

export default function CategorySection({ name, contacts, onEdit, onDelete }: Props) {
  return (
    <section className="category-section">
      <h2 className="category-heading">{name}</h2>
      <div className="card-grid">
        {contacts.map((c) => (
          <ContactCard key={c.id} contact={c} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}
