import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name } = req.body as { name?: string };
  if (!name?.trim()) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  try {
    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    const result = stmt.run(name.trim());
    const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch {
    res.status(409).json({ error: 'Category name already exists' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params['id']);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(204).send();
  } catch {
    res.status(409).json({ error: 'Cannot delete category with existing contacts' });
  }
});

export default router;
