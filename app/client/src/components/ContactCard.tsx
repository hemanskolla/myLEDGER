import type { ContactWithNotes } from '@shared/types';

interface Props {
  contact: ContactWithNotes;
  onEdit: (contact: ContactWithNotes) => void;
  onDelete: (id: number) => void;
}

export default function ContactCard({ contact, onEdit, onDelete }: Props) {
  return (
    <div className="contact-card">
      <div className="card-header">
        <div>
          <h3 className="card-name">{contact.name}</h3>
          {(contact.role || contact.company) && (
            <p className="card-subtitle">
              {[contact.role, contact.company].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <div className="card-actions">
          <button className="card-btn" onClick={() => onEdit(contact)} aria-label="Edit">✏️</button>
          <button className="card-btn card-btn--danger" onClick={() => onDelete(contact.id)} aria-label="Delete">🗑</button>
        </div>
      </div>
      {contact.where_met && (
        <span className="card-badge">Met at: {contact.where_met}</span>
      )}
      {contact.notes.length > 0 && (
        <ul className="card-notes">
          {contact.notes.map((n) => (
            <li key={n.id}>{n.body}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
