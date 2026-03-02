import mysql from 'mysql2/promise';
import { DrizzleMySQLAdapter } from '@lucia-auth/adapter-drizzle';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import { MySqlTransaction } from 'drizzle-orm/mysql-core';

import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  db: any;
  pool: mysql.Pool | undefined;
};

const poolConnection = globalForDb.pool ?? mysql.createPool({
  uri: process.env.DATABASE_URL!,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const db = globalForDb.db ?? drizzle(poolConnection, { schema, mode: 'default' });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = poolConnection;
  globalForDb.db = db;
}

// Setup lucia adapter
export const luciaAdapter = new DrizzleMySQLAdapter(db, schema.sessions, schema.users);

// Export Transaction type to be used in repositories
type Schema = {
  users: typeof schema.users;
  sessions: typeof schema.sessions;
  categories: typeof schema.categories;
  products: typeof schema.products;
  product_photos: typeof schema.product_photos;
};
export type Transaction = MySqlTransaction<
  any,
  any,
  Schema,
  ExtractTablesWithRelations<Schema>
>;
