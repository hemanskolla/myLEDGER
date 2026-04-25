import { MongoClient, Db } from 'mongodb';

let _db: Db;

export async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');

  const client = new MongoClient(uri);
  await client.connect();
  _db = client.db();

  await _db.collection('categories').createIndex({ name: 1 }, { unique: true });
}

export function getDb(): Db {
  return _db;
}
