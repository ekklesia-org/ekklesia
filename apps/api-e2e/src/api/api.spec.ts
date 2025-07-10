import axios from 'axios';

describe('GET /api', () => {
  it('should return API info', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual(
      expect.objectContaining({
        service: 'Ekklesia API',
        version: '1.0.0',
      })
    );
    expect(typeof res.data.status).toBe('string');
  });
});
