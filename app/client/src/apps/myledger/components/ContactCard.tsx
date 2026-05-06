import type { ContactWithNotes } from '@shared/types/myledger';

interface Props {
  contact: ContactWithNotes;
  status: 'actual' | 'potential';
  onEdit: (contact: ContactWithNotes) => void;
  onDelete: (id: string) => void;
}

export default function ContactCard({ contact, status, onEdit, onDelete }: Props) {
  return (
    <div className={`contact-card${status === 'potential' ? ' contact-card--potential' : ''}`}>
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
      {(contact.email || contact.phone || contact.linkedin) && (
        <div className="card-contact-info">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="card-contact-link">
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1.5 2h13A1.5 1.5 0 0 1 16 3.5v9A1.5 1.5 0 0 1 14.5 14h-13A1.5 1.5 0 0 1 0 12.5v-9A1.5 1.5 0 0 1 1.5 2Zm0 1L8 8.685 14.5 3H1.5ZM1 12.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V4.315l-6.5 5.57a.5.5 0 0 1-.648 0L1 4.315V12.5Z"/></svg>
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="card-contact-link">
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z"/></svg>
              {contact.phone}
            </a>
          )}
          {contact.linkedin && (
            <a href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="card-contact-link">
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/></svg>
              LinkedIn
            </a>
          )}
        </div>
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
