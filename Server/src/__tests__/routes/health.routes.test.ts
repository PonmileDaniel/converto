import request from 'supertest';
import express from 'express';
import healthRoutes from '../../routes/health.routes';

describe('Health Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/', healthRoutes);
  });

  describe('GET /', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        service: 'Currency converter API'
      });
    });
  });
});