import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { db } from './drizzle/db';
import * as schema from './drizzle/schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  public db = db;
  public schema = schema;

  async onModuleInit() {
    // Connection is managed by the Pool automatically
    console.log('Database connected');
  }

  async onModuleDestroy() {
    // Pool will be closed when the application shuts down
    console.log('Database disconnected');
  }
}
