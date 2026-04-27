import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDb, OTHER_CATEGORY_ID } from '../db.js';
import type { ContactWithNotes } from '../../shared/types.js';

const router = Router();

function toContact(doc: Record<string, any>): ContactWithNotes {
  // Support both legacy single category_id and new category_ids array
  let categoryIds: string[];
  if (Array.isArray(doc.category_ids)) {
    categoryIds = doc.category_ids.map((id: ObjectId) => id.toString());
  } else if (doc.category_id) {
    categoryIds = [doc.category_id.toString()];
  } else {
    categoryIds = [OTHER_CATEGORY_ID.toString()];
  }

  return {
    id: doc._id.toString(),
    name: doc.name,
    role: doc.role ?? null,
    company: doc.company ?? null,
    where_met: doc.where_met ?? null,
    linkedin: doc.linkedin ?? null,
    email: doc.email ?? null,
    phone: doc.phone ?? null,
    category_ids: categoryIds,
    status: doc.status === 'potential' ? 'potential' : 'actual',
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    notes: (doc.notes ?? []).map((n: Record<string, any>) => ({
      id: n._id.toString(),
      contact_id: doc._id.toString(),
      body: n.body,
      position: n.position,
    })),
  };
}

function parseNotes(bodies: string[]) {
  return bodies
    .filter((b) => b.trim())
    .map((body, i) => ({ _id: new ObjectId(), body: body.trim(), position: i }));
}

function parseCategoryIds(ids: string[]): ObjectId[] {
  return ids.map((id) => new ObjectId(id));
}

router.get('/', async (_req, res) => {
  const docs = await getDb().collection('contacts').find().sort({ created_at: 1 }).toArray();
  res.json(docs.map(toContact));
});

router.post('/', async (req, res) => {
  const { name, role, company, where_met, linkedin, email, phone, category_ids, status, notes } = req.body as {
    name?: string; role?: string; company?: string;
    where_met?: string; linkedin?: string; email?: string; phone?: string;
    category_ids?: string[]; status?: string; notes?: string[];
  };

  if (!name?.trim()) {
    res.status(400).json({ error: 'name is required' });
    return;
  }

  let catOids: ObjectId[];
  if (category_ids?.length) {
    try { catOids = parseCategoryIds(category_ids); }
    catch { res.status(400).json({ error: 'Invalid category_ids' }); return; }
  } else {
    catOids = [OTHER_CATEGORY_ID];
  }

  const now = new Date().toISOString();
  const result = await getDb().collection('contacts').insertOne({
    name: name.trim(),
    role: role?.trim() || null,
    company: company?.trim() || null,
    where_met: where_met?.trim() || null,
    linkedin: linkedin?.trim() || null,
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    category_ids: catOids,
    status: status === 'potential' ? 'potential' : 'actual',
    notes: parseNotes(notes ?? []),
    created_at: now,
    updated_at: now,
  });

  const doc = await getDb().collection('contacts').findOne({ _id: result.insertedId });
  res.status(201).json(toContact(doc!));
});

router.put('/:id', async (req, res) => {
  let oid: ObjectId;
  try { oid = new ObjectId(req.params['id']); }
  catch { res.status(404).json({ error: 'Not found' }); return; }

  const { name, role, company, where_met, linkedin, email, phone, category_ids, status, notes } = req.body as {
    name?: string; role?: string; company?: string;
    where_met?: string; linkedin?: string; email?: string; phone?: string;
    category_ids?: string[]; status?: string; notes?: string[];
  };

  if (!name?.trim() || !category_ids?.length) {
    res.status(400).json({ error: 'name and category_ids are required' });
    return;
  }

  let catOids: ObjectId[];
  try { catOids = parseCategoryIds(category_ids); }
  catch { res.status(400).json({ error: 'Invalid category_ids' }); return; }

  const doc = await getDb().collection('contacts').findOneAndUpdate(
    { _id: oid },
    {
      $set: {
        name: name.trim(),
        role: role?.trim() || null,
        company: company?.trim() || null,
        where_met: where_met?.trim() || null,
        linkedin: linkedin?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        category_ids: catOids,
        status: status === 'potential' ? 'potential' : 'actual',
        notes: parseNotes(notes ?? []),
        updated_at: new Date().toISOString(),
      },
      $unset: { category_id: '' },
    },
    { returnDocument: 'after' },
  );

  if (!doc) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(toContact(doc));
});

router.delete('/:id', async (req, res) => {
  let oid: ObjectId;
  try { oid = new ObjectId(req.params['id']); }
  catch { res.status(404).json({ error: 'Not found' }); return; }

  const result = await getDb().collection('contacts').deleteOne({ _id: oid });
  if (result.deletedCount === 0) { res.status(404).json({ error: 'Not found' }); return; }
  res.status(204).send();
});

export default router;
