import request from 'supertest';
import express from 'express';
import { CurrencyController } from '../../controllers/currency.controller';
import { CurrencyService } from '../../services/currency.service';

jest.mock('../../services/currency.service');
const MockCurrencyService = CurrencyService as jest.MockedClass<typeof CurrencyService>;

describe('CurrencyController', () => {
    let app: express.Application;
    let mockCurrencyService: jest.Mocked<CurrencyService>;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        mockCurrencyService = new MockCurrencyService() as jest.Mocked<CurrencyService>;
        const controller = new CurrencyController();
        (controller as any).currencyService = mockCurrencyService;

        app.get('/convert', controller.convert);
        app.get('/providers/status', controller.getProviderStatus);
    });

    describe('convert', () => {
        it('should convert currency successfully', async () => {
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
                .get('/convert')
                .query({ from: 'USD', to: 'EUR', amount: 100 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /providers/status', () => {
        it('should return provider status', async () => {
            const mockProviders = [
                { name: 'fixer', priority: 1, is_active: true },
                { name: 'currencyapi', priority: 2, is_active: true }
            ];

            mockCurrencyService.getProviderStatus.mockResolvedValue(mockProviders);

            const response = await request(app).get('/providers/status');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockProviders);
        });
    });
})