import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/pickup_give';

export const client = postgres(connectionString);
export const db = drizzle(client, { schema });