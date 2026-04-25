import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import type { ContactWithNotes } from '../../shared/types.js';

const router = Router();
router.use(requireAuth);

type ContactRow = {
  id: number;
  name: string;
  role: string | null;
  company: string | null;
  where_met: string | null;
  category_id: number;
  created_at: string;
  updated_at: string;
  note_id: number | null;
  body: string | null;
  position: number | null;
};

function groupContacts(rows: ContactRow[]): ContactWithNotes[] {
  const map = new Map<number, ContactWithNotes>();
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        name: row.name,
        role: row.role,
        company: row.company,
        where_met: row.where_met,
        category_id: row.category_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        notes: [],
      });
    }
    if (row.note_id !== null && row.body !== null) {
      map.get(row.id)!.notes.push({
        id: row.note_id,
        contact_id: row.id,
        body: row.body,
        position: row.position ?? 0,
      });
    }
  }
  return Array.from(map.values());
}

router.get('/', (_req, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.name, c.role, c.company, c.where_met, c.category_id, c.created_at, c.updated_at,
           n.id as note_id, n.body, n.position
    FROM contacts c
    LEFT JOIN notes n ON n.contact_id = c.id
    ORDER BY c.id, n.position
  `).all() as ContactRow[];

  res.json(groupContacts(rows));
});

router.post('/', (req, res) => {
  const { name, role, company, where_met, category_id, notes } =
    req.body as {
      name?: string;
      role?: string;
      company?: string;
      where_met?: string;
      category_id?: number;
      notes?: string[];
    };

  if (!name?.trim() || !category_id) {
    res.status(400).json({ error: 'name and category_id are required' });
    return;
  }

  const insert = db.transaction(() => {
    const result = db.prepare(
      `INSERT INTO contacts (name, role, company, where_met, category_id)
       VALUES (?, ?, ?, ?, ?)`
    ).run(name.trim(), role ?? null, company ?? null, where_met ?? null, category_id);

    const contactId = result.lastInsertRowid;
    const noteStmt = db.prepare('INSERT INTO notes (contact_id, body, position) VALUES (?, ?, ?)');
    (notes ?? []).forEach((body, i) => {
      if (body.trim()) noteStmt.run(contactId, body.trim(), i);
    });

    return contactId;
  });

  const contactId = insert();

  const rows = db.prepare(`
    SELECT c.id, c.name, c.role, c.company, c.where_met, c.category_id, c.created_at, c.updated_at,
           n.id as note_id, n.body, n.position
    FROM contacts c
    LEFT JOIN notes n ON n.contact_id = c.id
    WHERE c.id = ?
    ORDER BY n.position
  `).all(contactId) as ContactRow[];

  res.status(201).json(groupContacts(rows)[0]);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params['id']);
  const { name, role, company, where_met, category_id, notes } =
    req.body as {
      name?: string;
      role?: string;
      company?: string;
      where_met?: string;
      category_id?: number;
      notes?: string[];
    };

  if (!name?.trim() || !category_id) {
    res.status(400).json({ error: 'name and category_id are required' });
    return;
  }

  const update = db.transaction(() => {
    const result = db.prepare(
      `UPDATE contacts
       SET name = ?, role = ?, company = ?, where_met = ?, category_id = ?,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       WHERE id = ?`
    ).run(name.trim(), role ?? null, company ?? null, where_met ?? null, category_id, id);

    if (result.changes === 0) return false;

    db.prepare('DELETE FROM notes WHERE contact_id = ?').run(id);
    const noteStmt = db.prepare('INSERT INTO notes (contact_id, body, position) VALUES (?, ?, ?)');
    (notes ?? []).forEach((body, i) => {
      if (body.trim()) noteStmt.run(id, body.trim(), i);
    });

    return true;
  });

  const found = update();
  if (!found) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const rows = db.prepare(`
    SELECT c.id, c.name, c.role, c.company, c.where_met, c.category_id, c.created_at, c.updated_at,
           n.id as note_id, n.body, n.position
    FROM contacts c
    LEFT JOIN notes n ON n.contact_id = c.id
    WHERE c.id = ?
    ORDER BY n.position
  `).all(id) as ContactRow[];

  res.json(groupContacts(rows)[0]);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params['id']);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.status(204).send();
});

export default router;
