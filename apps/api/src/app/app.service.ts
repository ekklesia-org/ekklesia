import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@ekklesia/database';
import { sql } from 'drizzle-orm';

@Injectable()
export class AppService {
  private readonly startTime = Date.now();
  
  constructor(private drizzle: DrizzleService) {}

  async getApiInfo() {
    const uptime = (Date.now() - this.startTime) / 1000; // uptime in seconds
    
    // Check database connection
    let databaseStatus = 'connected';
    try {
      await this.drizzle.db.execute(sql`SELECT 1`);
    } catch (error) {
      databaseStatus = 'disconnected';
    }

    return {
      status: databaseStatus === 'connected' ? 'healthy' : 'degraded',
      service: 'Ekklesia API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime * 100) / 100, // rounded to 2 decimal places
      environment: process.env['NODE_ENV'] || 'development',
      database: {
        status: databaseStatus,
        type: 'postgresql'
      },
      features: {
        authentication: true,
        multiTenant: true,
        documentation: '/api/docs'
      },
      endpoints: {
        health: '/api',
        auth: '/api/auth',
        docs: '/api/docs'
      }
    };
  }
}
