import { MongoClient, Db, ObjectId } from 'mongodb';

let _db!: Db;
let _otherId!: ObjectId;

export async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');

  const client = new MongoClient(uri);
  await client.connect();
  _db = client.db(process.env.DB_NAME ?? 'ledger-db');

  await _db.collection('categories').createIndex({ name: 1 }, { unique: true });

  const other = await _db.collection('categories').findOneAndUpdate(
    { name: 'Other' },
    { $setOnInsert: { name: 'Other', created_at: new Date().toISOString() } },
    { upsert: true, returnDocument: 'after' },
  );
  _otherId = other!._id as ObjectId;
}

export function getDb(): Db {
  return _db;
}

export function getOtherId(): ObjectId {
  return _otherId;
}
