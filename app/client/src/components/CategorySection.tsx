import type { ContactWithNotes } from '@shared/types';
import ContactCard from './ContactCard';

interface Props {
  name: string;
  contacts: ContactWithNotes[];
  onEdit: (contact: ContactWithNotes) => void;
  onDelete: (id: string) => void;
}

export default function CategorySection({ name, contacts, onEdit, onDelete }: Props) {
  const actual = contacts.filter((c) => c.status !== 'potential');
  const potential = contacts.filter((c) => c.status === 'potential');

  return (
    <section className="category-section">
      <h2 className="category-heading">{name}</h2>

      <div className="status-group">
        <h3 className="status-subheading">Actual</h3>
        {actual.length > 0 ? (
          <div className="card-grid">
            {actual.map((c) => (
              <ContactCard key={c.id} contact={c} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        ) : (
          <p className="status-empty">No actual contacts yet.</p>
        )}
      </div>

      <div className="status-group">
        <h3 className="status-subheading">Potential</h3>
        {potential.length > 0 ? (
          <div className="card-grid">
            {potential.map((c) => (
              <ContactCard key={c.id} contact={c} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        ) : (
          <p className="status-empty">No potential contacts yet.</p>
        )}
      </div>
    </section>
  );
}
