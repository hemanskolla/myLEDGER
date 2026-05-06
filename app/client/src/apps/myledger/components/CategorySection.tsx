import type { ContactWithNotes } from '@shared/types/myledger';
import ContactCard from './ContactCard';

interface Entry {
  contact: ContactWithNotes;
  status: 'actual' | 'potential';
}

interface Props {
  name: string;
  entries: Entry[];
  onEdit: (contact: ContactWithNotes) => void;
  onDelete: (id: string) => void;
}

export default function CategorySection({ name, entries, onEdit, onDelete }: Props) {
  const actual = entries.filter((e) => e.status !== 'potential');
  const potential = entries.filter((e) => e.status === 'potential');

  return (
    <section className="category-section">
      <h2 className="category-heading">{name}</h2>

      <div className="status-group">
        <h3 className="status-subheading">Actual</h3>
        {actual.length > 0 ? (
          <div className="card-grid">
            {actual.map((e) => (
              <ContactCard key={e.contact.id} contact={e.contact} status={e.status} onEdit={onEdit} onDelete={onDelete} />
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
            {potential.map((e) => (
              <ContactCard key={e.contact.id} contact={e.contact} status={e.status} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        ) : (
          <p className="status-empty">No potential contacts yet.</p>
        )}
      </div>
    </section>
  );
}
