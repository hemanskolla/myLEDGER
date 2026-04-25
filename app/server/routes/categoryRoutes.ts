import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const docs = await getDb().collection('categories').find().sort({ name: 1 }).toArray();
  res.json(docs.map((d) => ({ id: d._id.toString(), name: d.name, created_at: d.created_at })));
});

router.post('/', async (req, res) => {
  const { name } = req.body as { name?: string };
  if (!name?.trim()) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  try {
    const now = new Date().toISOString();
    const result = await getDb().collection('categories').insertOne({ name: name.trim(), created_at: now });
    res.status(201).json({ id: result.insertedId.toString(), name: name.trim(), created_at: now });
  } catch {
    res.status(409).json({ error: 'Category name already exists' });
  }
});

router.delete('/:id', async (req, res) => {
  let oid: ObjectId;
  try { oid = new ObjectId(req.params['id']); }
  catch { res.status(404).json({ error: 'Not found' }); return; }

  const inUse = await getDb().collection('contacts').countDocuments({ category_id: oid });
  if (inUse > 0) {
    res.status(409).json({ error: 'Cannot delete category with existing contacts' });
    return;
  }

  const result = await getDb().collection('categories').deleteOne({ _id: oid });
  if (result.deletedCount === 0) { res.status(404).json({ error: 'Not found' }); return; }
  res.status(204).send();
});

export default router;
