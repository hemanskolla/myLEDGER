import { MongoClient, Db, ObjectId } from 'mongodb';

let _ledger_db!: Db;

export const OTHER_CATEGORY_ID = new ObjectId('69ed71237ba869aee9620036');

export async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');

  const client = new MongoClient(uri);
  await client.connect();
  _ledger_db = client.db(process.env.MYLEDGER_DB_NAME);

  await _db.collection('categories').createIndex({ name: 1 }, { unique: true });

  // Step 1: scalar category_id → category_ids array
  const legacyScalar = await _db.collection('contacts')
    .find({ category_id: { $exists: true }, category_ids: { $exists: false } })
    .project({ _id: 1, category_id: 1 })
    .toArray();
  if (legacyScalar.length > 0) {
    await _db.collection('contacts').bulkWrite(
      legacyScalar.map((doc) => ({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { category_ids: [doc.category_id] }, $unset: { category_id: '' } },
        },
      }))
    );
  }

  // Step 2: category_ids array + status → categories: [{id, status}]
  const legacyArray = await _db.collection('contacts')
    .find({ category_ids: { $exists: true }, categories: { $exists: false } })
    .project({ _id: 1, category_ids: 1, status: 1 })
    .toArray();
  if (legacyArray.length > 0) {
    await _db.collection('contacts').bulkWrite(
      legacyArray.map((doc) => ({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              categories: (doc.category_ids as ObjectId[]).map((id) => ({
                id,
                status: doc.status === 'potential' ? 'potential' : 'actual',
              })),
            },
            $unset: { category_ids: '', status: '' },
          },
        },
      }))
    );
  }
}

export function getDb(): Db {
  return _ledger_db;
}
