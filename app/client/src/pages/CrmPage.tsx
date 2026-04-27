import { useEffect, useMemo, useState } from 'react';
import type { Category, ContactWithNotes } from '@shared/types';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import CategorySection from '../components/CategorySection';
import FabMenu from '../components/FabMenu';
import AddCategoryModal from '../components/AddCategoryModal';
import AddContactModal from '../components/AddContactModal';

type Modal = 'none' | 'category' | 'contact';

export default function CrmPage() {
  const [contacts, setContacts] = useState<ContactWithNotes[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<Modal>('none');
  const [editing, setEditing] = useState<ContactWithNotes | null>(null);

  async function reload(retries = 8): Promise<void> {
    try {
      const [cs, cats] = await Promise.all([
        fetch('/api/contacts').then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<ContactWithNotes[]>; }),
        fetch('/api/categories').then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<Category[]>; }),
      ]);
      setContacts(cs);
      setCategories(cats);
    } catch {
      if (retries > 0) setTimeout(() => void reload(retries - 1), 1000);
    }
  }

  useEffect(() => { void reload(); }, []);

  function handleFilterToggle(id: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.company ?? '').toLowerCase().includes(q) ||
        (c.role ?? '').toLowerCase().includes(q);
      const matchFilter =
        activeFilters.size === 0 || c.category_ids.some((id) => activeFilters.has(id));
      return matchSearch && matchFilter;
    });
  }, [contacts, search, activeFilters]);

  const grouped = useMemo(() => {
    const map = new Map<string, ContactWithNotes[]>();
    for (const c of filtered) {
      for (const catId of c.category_ids) {
        if (!map.has(catId)) map.set(catId, []);
        map.get(catId)!.push(c);
      }
    }
    return map;
  }, [filtered]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this contact?')) return;
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    void reload();
  }

  function handleEdit(contact: ContactWithNotes) {
    setEditing(contact);
    setModal('contact');
  }

  return (
    <div className="crm-layout">
      <header className="crm-header">
        <span className="crm-logo">myLEDGER</span>
      </header>

      <div className="crm-toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar
          categories={categories}
          activeFilters={activeFilters}
          onToggle={handleFilterToggle}
          onClearAll={() => setActiveFilters(new Set())}
          onReorder={(newOrder) => {
            setCategories(newOrder);
            void fetch('/api/categories/order', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order: newOrder.map((c) => c.id) }),
            });
          }}
        />
      </div>

      <main className="crm-main">
        {categories
          .filter((cat) => (activeFilters.size === 0 || activeFilters.has(cat.id)) && (!search || grouped.has(cat.id)))
          .map((cat) => (
            <CategorySection
              key={cat.id}
              name={cat.name}
              contacts={grouped.get(cat.id) ?? []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        {categories.length === 0 && (
          <div className="empty-state">
            {'No contacts yet. Hit + to add your first one.'}
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
