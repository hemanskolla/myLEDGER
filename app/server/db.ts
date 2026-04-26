import { MongoClient, Db, ObjectId } from 'mongodb';

let _db!: Db;

export const OTHER_CATEGORY_ID = new ObjectId('69ed71237ba869aee9620036');

export async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');

  const client = new MongoClient(uri);
  await client.connect();
  _db = client.db(process.env.DB_NAME ?? 'ledger-db');

  await _db.collection('categories').createIndex({ name: 1 }, { unique: true });

  // Migrate: convert single category_id to category_ids array
  const legacyContacts = await _db.collection('contacts')
    .find({ category_id: { $exists: true }, category_ids: { $exists: false } })
    .project({ _id: 1, category_id: 1 })
    .toArray();
  if (legacyContacts.length > 0) {
    await _db.collection('contacts').bulkWrite(
      legacyContacts.map((doc) => ({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { category_ids: [doc.category_id] }, $unset: { category_id: '' } },
        },
      }))
    );
  }
}

export function getDb(): Db {
  return _db;
}
