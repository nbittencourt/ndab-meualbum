import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ndab-meualbum';
await mongoose.connect(uri);
const db = mongoose.connection.db;
const result = await db.collection('users').updateOne(
  { email: 'test@user.com' },
  { $set: { status: 'ATIVO' } }
);
console.log('matched:', result.matchedCount, 'modified:', result.modifiedCount);
await mongoose.disconnect();
