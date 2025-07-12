import 'ts-node/register/transpile-only';

describe('AppService', () => {
  let AppService: any;
  let appService: any;
  let mockDrizzleService: { db: { execute: jest.Mock } };

  beforeEach(() => {
    AppService = require('./app.service').AppService;
    mockDrizzleService = { 
      db: { 
        execute: jest.fn().mockResolvedValue([{ '?column?': 1 }]) 
      } 
    } as any;
    appService = new AppService(mockDrizzleService);
  });

  it('getApiInfo should report healthy status and connected database', async () => {
    const result = await appService.getApiInfo();
    expect(result.status).toBe('healthy');
    expect(result.service).toBe('Ekklesia API');
    expect(result.database.status).toBe('connected');
  });

  it('getApiInfo should report degraded status when database is disconnected', async () => {
    mockDrizzleService.db.execute.mockRejectedValueOnce(new Error('Connection failed'));
    const result = await appService.getApiInfo();
    expect(result.status).toBe('degraded');
    expect(result.service).toBe('Ekklesia API');
    expect(result.database.status).toBe('disconnected');
  });
});
