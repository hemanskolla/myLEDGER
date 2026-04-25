import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category, ContactWithNotes } from '@shared/types';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import CategorySection from '../components/CategorySection';
import FabMenu from '../components/FabMenu';
import AddCategoryModal from '../components/AddCategoryModal';
import AddContactModal from '../components/AddContactModal';

type Modal = 'none' | 'category' | 'contact';

export default function CrmPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<ContactWithNotes[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [modal, setModal] = useState<Modal>('none');
  const [editing, setEditing] = useState<ContactWithNotes | null>(null);

  async function reload() {
    const [cs, cats] = await Promise.all([
      fetch('/api/contacts').then((r) => r.json() as Promise<ContactWithNotes[]>),
      fetch('/api/categories').then((r) => r.json() as Promise<Category[]>),
    ]);
    setContacts(cs);
    setCategories(cats);
  }

  useEffect(() => { void reload(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.company ?? '').toLowerCase().includes(q) ||
        (c.role ?? '').toLowerCase().includes(q);
      const matchFilter = activeFilter === null || c.category_id === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [contacts, search, activeFilter]);

  const grouped = useMemo(() => {
    const map = new Map<number, ContactWithNotes[]>();
    for (const c of filtered) {
      if (!map.has(c.category_id)) map.set(c.category_id, []);
      map.get(c.category_id)!.push(c);
    }
    return map;
  }, [filtered]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this contact?')) return;
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    void reload();
  }

  function handleEdit(contact: ContactWithNotes) {
    setEditing(contact);
    setModal('contact');
  }

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="crm-layout">
      <header className="crm-header">
        <span className="crm-logo">myLEDGER</span>
        <div className="crm-header-right">
          {user && (
            <>
              <img src={user.picture} alt={user.name} className="avatar" referrerPolicy="no-referrer" />
              <button className="btn btn--ghost btn--sm" onClick={handleLogout}>Sign out</button>
            </>
          )}
        </div>
      </header>

      <div className="crm-toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar categories={categories} active={activeFilter} onSelect={setActiveFilter} />
      </div>

      <main className="crm-main">
        {categories
          .filter((cat) => grouped.has(cat.id))
          .map((cat) => (
            <CategorySection
              key={cat.id}
              name={cat.name}
              contacts={grouped.get(cat.id)!}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            {contacts.length === 0
              ? 'No contacts yet. Hit + to add your first one.'
              : 'No contacts match your search.'}
          </div>
        )}
      </main>

      <FabMenu
        onAddCategory={() => setModal('category')}
        onAddContact={() => { setEditing(null); setModal('contact'); }}
      />

      {modal === 'category' && (
        <AddCategoryModal
          onClose={() => setModal('none')}
          onSuccess={() => void reload()}
        />
      )}

      {modal === 'contact' && (
        <AddContactModal
          categories={categories}
          editing={editing}
          onClose={() => { setModal('none'); setEditing(null); }}
          onSuccess={() => void reload()}
        />
      )}
    </div>
  );
}
