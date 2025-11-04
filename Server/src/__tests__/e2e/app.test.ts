import request from 'supertest';
import express from 'express';
import { CurrencyController } from '../../controllers/currency.controller';
import { CurrencyService } from '../../services/currency.service';
import healthRoutes from '../../routes/health.routes';
import appRoutes from '../../routes/app.routes';

jest.mock('../../config/database');
jest.mock('../../config/redis');
jest.mock('../../services/currency.service');

const MockCurrencyService = CurrencyService as jest.MockedClass<typeof CurrencyService>;

describe('App E2E Tests', () => {
  let app: express.Application;
  let mockCurrencyService: jest.Mocked<CurrencyService>;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    mockCurrencyService = new MockCurrencyService() as jest.Mocked<CurrencyService>;
    
    const currencyController = new CurrencyController();
    (currencyController as any).currencyService = mockCurrencyService;

    app.use('/', appRoutes);
    app.use('/health', healthRoutes);
    app.get('/api/currency/convert', currencyController.convert);
    app.get('/api/currency/providers', currencyController.getProviderStatus);
  });

  describe('Health Endpoints', () => {
    it('should return app info on root', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Currency converter API');
    });

    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Currency API', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle currency conversion', async () => {
      const mockResult = {
        rate: 0.85,
        amount: 100,
        convertedAmount: 85,
        cached: false,
        source: 'fixer',
        timestamp: '2023-01-01T00:00:00.000Z'
      };

      mockCurrencyService.convertCurrency.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/currency/convert')
        .query({ from: 'USD', to: 'EUR', amount: 100 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.convertedAmount).toBe(85);
    });

    it('should handle currency conversion errors', async () => {
      mockCurrencyService.convertCurrency.mockRejectedValue(
        new Error('All providers failed')
      );

      const response = await request(app)
        .get('/api/currency/convert')
        .query({ from: 'USD', to: 'EUR', amount: 100 });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });

    it('should validate input parameters', async () => {
      const response = await request(app)
        .get('/api/currency/convert')
        .query({ from: 'US', to: 'EUR', amount: 100 }); 
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('length must be 3 characters');
    });

    it('should return provider status', async () => {
      const mockProviders = [
        { name: 'fixer', priority: 1, is_active: true },
        { name: 'currencyapi', priority: 2, is_active: true }
      ];

      mockCurrencyService.getProviderStatus.mockResolvedValue(mockProviders);

      const response = await request(app)
        .get('/api/currency/providers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProviders);
    });
  });
});