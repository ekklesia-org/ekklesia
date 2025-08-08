import { db } from './drizzle/db';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './drizzle/schema';

export class DrizzleService {
  public db: NodePgDatabase<typeof schema>;

  constructor() {
    this.db = db;
  }
}
