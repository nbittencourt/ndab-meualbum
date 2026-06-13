import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer | undefined;

/**
 * Sobe um MongoDB em memória para os testes de integração e conecta o Mongoose.
 * Em ambientes sem acesso ao fastdl.mongodb.org, aponte MONGOMS_SYSTEM_BINARY
 * para um mongod local (ex.: export MONGOMS_SYSTEM_BINARY=/usr/bin/mongod).
 */
export async function startMongo(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

export async function clearCollections(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

export async function stopMongo(): Promise<void> {
  await mongoose.disconnect();
  await mongod?.stop();
}
