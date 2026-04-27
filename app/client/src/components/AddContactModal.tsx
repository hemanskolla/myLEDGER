import { useState } from 'react';
import type { Category, ContactWithNotes } from '@shared/types';

interface Props {
  categories: Category[];
  editing?: ContactWithNotes | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddContactModal({ categories, editing, onClose, onSuccess }: Props) {
  const [name, setName] = useState(editing?.name ?? '');
  const [role, setRole] = useState(editing?.role ?? '');
  const [company, setCompany] = useState(editing?.company ?? '');
  const [whereMet, setWhereMet] = useState(editing?.where_met ?? '');
  const [linkedin, setLinkedin] = useState(editing?.linkedin ?? '');
  const [email, setEmail] = useState(editing?.email ?? '');
  const [phone, setPhone] = useState(editing?.phone ?? '');
  const [categoryIds, setCategoryIds] = useState<string[]>(editing?.category_ids ?? []);
  const [status, setStatus] = useState<'actual' | 'potential'>(editing?.status ?? 'actual');
  const [notes, setNotes] = useState(editing?.notes.map((n) => n.body).join('\n') ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleCategory(id: string, checked: boolean) {
    setCategoryIds(checked ? [...categoryIds, id] : categoryIds.filter((c) => c !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || categoryIds.length === 0) {
      setError('Name and at least one category are required.');
      return;
    }
    setSaving(true);

    const payload = {
      name: name.trim(),
      role: role.trim() || undefined,
      company: company.trim() || undefined,
      where_met: whereMet.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      category_ids: categoryIds,
      status,
      notes: notes.split('\n').filter((l) => l.trim()),
    };

    const url = editing ? `/api/contacts/${editing.id}` : '/api/contacts';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      const data = await res.json() as { error?: string };
      setError(data.error ?? 'Failed to save');
    }
  }

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.name === 'Other') return 1;
    if (b.name === 'Other') return -1;
    return 0;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <dialog className="modal modal--wide" open onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{editing ? 'Edit Contact' : 'Add Contact'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <label className="modal-label">
              Name *
              <input className="modal-input" type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
            </label>
            <label className="modal-label">
              Role
              <input className="modal-input" type="text" value={role} onChange={(e) => setRole(e.target.value)} />
            </label>
            <label className="modal-label">
              Company
              <input className="modal-input" type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
            </label>
            <label className="modal-label">
              Where met
              <input className="modal-input" type="text" value={whereMet} onChange={(e) => setWhereMet(e.target.value)} />
            </label>
            <label className="modal-label">
              LinkedIn
              <input className="modal-input" type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/…" />
            </label>
            <label className="modal-label">
              Email
              <input className="modal-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="modal-label">
              Phone
              <input className="modal-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="modal-label modal-label--checkbox">
              <input
                type="checkbox"
                checked={status === 'potential'}
                onChange={(e) => setStatus(e.target.checked ? 'potential' : 'actual')}
              />
              Potential
            </label>
          </div>
          <div className="modal-label modal-label--full" style={{ marginTop: '.75rem' }}>
            <span>Categories *</span>
            <div className="category-checkbox-list">
              {sortedCategories.map((c) => (
                <label key={c.id} className="category-checkbox-item">
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(c.id)}
                    onChange={(e) => toggleCategory(c.id, e.target.checked)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
          <label className="modal-label modal-label--full" style={{ marginTop: '.75rem' }}>
            Notes (one bullet per line)
            <textarea
              className="modal-input modal-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Each line becomes a bullet point"
            />
          </label>
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add contact'}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
