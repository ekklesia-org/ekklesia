import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health & Info')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'API Health Check  Information',
    description: 'Returns API status, version, and basic statistics for health monitoring'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API information and health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        service: { type: 'string', example: 'Ekklesia API' },
        version: { type: 'string', example: '1.0.0' },
        timestamp: { type: 'string', example: '2025-01-08T01:30:00.000Z' },
        uptime: { type: 'number', example: 123.45 },
        environment: { type: 'string', example: 'development' },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'connected' },
            type: { type: 'string', example: 'postgresql' }
          }
        },
        features: {
          type: 'object',
          properties: {
            authentication: { type: 'boolean', example: true },
            multiTenant: { type: 'boolean', example: true },
            documentation: { type: 'string', example: '/api/docs' }
          }
        }
      }
    }
  })
  async getApiInfo() {
    return this.appService.getApiInfo();
  }
}
