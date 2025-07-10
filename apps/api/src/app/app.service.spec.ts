import 'ts-node/register/transpile-only';

describe('AppService', () => {
  let AppService: any;
  let appService: any;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(() => {
    AppService = require('./app.service').AppService;
    prisma = { $queryRaw: jest.fn().mockResolvedValue(1) } as any;
    appService = new AppService(prisma);
  });

  it('getApiInfo should report healthy status and connected database', async () => {
    const result = await appService.getApiInfo();
    expect(result.status).toBe('healthy');
    expect(result.service).toBe('Ekklesia API');
    expect(result.database.status).toBe('connected');
  });
});
