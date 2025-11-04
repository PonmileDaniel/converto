import { ExchangeRatesProvider } from "../../providers/exchange.provider";
import axios from 'axios';

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('ExchangeProvider', () => {
    let provider: ExchangeRatesProvider;

    beforeEach(() => {
        provider = new ExchangeRatesProvider();
        jest.clearAllMocks();
    });

    describe('fetchRates', () => {
        it('should fetch rates successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    rates: {
                        EUR: 0.85,
                        GBP: 0.73
                    }
                }
            };

            mockAxios.get.mockResolvedValue(mockResponse);
            const result = await provider.fetchRates('USD', ['EUR', 'GBP']);
            expect(result).toEqual({
                success: true,
                rates: { EUR: 0.85, GBP: 0.73 },
                source: 'exchangerates'
            });
        });

        
    });

    describe('convertCurrency', () => {
        it('should convert currency successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    rates: { EUR: 0.85 }
                }
            };

            mockAxios.get.mockResolvedValue(mockResponse);
            const result = await provider.convertCurrency('USD', 'EUR', 100);
            expect(result).toBe(85);
        });
    });
});